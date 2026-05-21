import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { queryCollection } from '@nuxt/content/server';
import {
	convertToModelMessages,
	createUIMessageStream,
	createUIMessageStreamResponse,
	safeValidateUIMessages,
	streamText,
	type ToolCallPart,
	type ToolSet,
	type UIMessage,
	type UIMessageStreamWriter,
} from 'ai';
import type { H3Event } from 'h3';
import getDirectusFile from '~~/server/mcp/tools/get-directus-file';
import getDoc from '~~/server/mcp/tools/get-doc';
import listDocs from '~~/server/mcp/tools/list-docs';
import searchDirectusCode from '~~/server/mcp/tools/search-directus-code';
import searchDocs from '~~/server/mcp/tools/search-docs';
import { assertAdmissible, enforceDailyLimits, isAdmitContext, rejectJson, type AssistantAdmitContext } from '../utils/admit';
import { bindMcpToolsForAI } from '../utils/bind-tools';
import { PROFILES } from '../utils/profiles';
import { boundRawMessages, sanitizePagePath, sanitizePrefs } from '../utils/sanitize';
import { systemPrompt } from '../../../prompts/system-prompt';

const PREFS_COOKIE = 'directus-docs-prefs';
const MAX_BODY_BYTES = 512 * 1024;

const PREF_KEYS: Array<keyof UserPreferences> = ['framework', 'useCase', 'deployment', 'role', 'experience'];
const PREF_LABELS: Record<keyof UserPreferences, string> = {
	framework: 'Preferred framework',
	useCase: 'Primary use case',
	deployment: 'Deployment target',
	role: 'Role',
	experience: 'Directus experience level',
};

type UserPreferences = {
	framework: string | null;
	useCase: string | null;
	deployment: string | null;
	role: string | null;
	experience: string | null;
};

function stopWhenResponseComplete(maxSteps: number) {
	return ({ steps }: { steps: Array<{ text?: string; toolCalls?: unknown[] }> }): boolean => {
		const lastStep = steps.at(-1);
		if (!lastStep) return false;
		const hasText = Boolean(lastStep.text && lastStep.text.trim().length > 0);
		const hasNoToolCalls = !lastStep.toolCalls || lastStep.toolCalls.length === 0;
		if (hasText && hasNoToolCalls) return true;
		return steps.length >= maxSteps;
	};
}

type StepContent = { content?: Array<{ type: string; toolName?: string }> };

function forceSummaryStep(maxSteps: number) {
	return ({ steps, stepNumber }: { steps: StepContent[]; stepNumber: number }) => {
		if (stepNumber >= maxSteps - 1) return { toolChoice: 'none' as const };

		const lastTwo = steps.slice(-2);
		if (lastTwo.length === 2) {
			const errors = lastTwo.map(s => s.content?.find(p => p.type === 'tool-error')?.toolName);
			if (errors[0] && errors[0] === errors[1]) return { toolChoice: 'none' as const };
		}

		return {};
	};
}

function flushPostHogAiTelemetry(requestId: string): void {
	const processor = (globalThis as typeof globalThis & { __directusAssistantOtelProcessor?: { forceFlush: () => Promise<void> } }).__directusAssistantOtelProcessor;
	if (!processor) return;
	void processor.forceFlush().catch(error => console.warn('[assistant:otel] force flush failed', { requestId, error }));
}

function readUserPrefs(event: H3Event): Partial<UserPreferences> | null {
	const cookie = getCookie(event, PREFS_COOKIE);
	if (!cookie) return null;
	try {
		const parsed = JSON.parse(decodeURIComponent(cookie));
		return sanitizePrefs(parsed);
	}
	catch {
		return null;
	}
}

async function readPagePath(event: H3Event, baseURL: string, requestId: string): Promise<string | null> {
	const pagePath = sanitizePagePath(getHeader(event, 'x-page-path'), baseURL);
	if (!pagePath) return null;
	const page = await queryCollection(event, 'content')
		.where('path', '=', pagePath)
		.first();
	if (!page) {
		console.warn('[assistant] rejected unknown page path', { requestId, pagePath });
		return null;
	}
	return pagePath;
}

function readSessionId(event: H3Event): string | undefined {
	const value = getHeader(event, 'x-assistant-session-id');
	if (!value) return undefined;
	return /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : undefined;
}

function buildSystemPrompt(basePrompt: string, pagePath: string | null, prefs: Partial<UserPreferences> | null): string {
	const parts: string[] = [];
	if (pagePath) parts.push(`Current page: ${pagePath}`);
	if (prefs) {
		const lines = PREF_KEYS
			.filter(key => typeof prefs[key] === 'string' && prefs[key])
			.map(key => `- ${PREF_LABELS[key]}: ${prefs[key]}`);
		if (lines.length > 0) parts.push(`User context:\n${lines.join('\n')}`);
	}
	parts.push(basePrompt);
	return parts.join('\n\n');
}

function compactMessagesForModel(messages: UIMessage[], messageLimit: number): UIMessage[] {
	return messages
		.slice(-messageLimit)
		.map((message) => {
			return {
				...message,
				parts: message.parts?.filter((part: { type: string }) => part.type === 'text') ?? [],
			} as UIMessage;
		})
		.filter(message => message.parts.length > 0);
}

async function parseAndValidate(event: H3Event, ctx: AssistantAdmitContext): Promise<{ messages: UIMessage[] } | Record<string, unknown>> {
	const contentLength = Number(getHeader(event, 'content-length') || 0);
	if (contentLength > MAX_BODY_BYTES) {
		return rejectJson(event, 413, 'PAYLOAD_TOO_LARGE', 'Message is too large. Shorten your request and try again.', ctx);
	}

	const raw = await readRawBody(event);
	if (!raw || Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
		return rejectJson(event, 413, 'PAYLOAD_TOO_LARGE', 'Message is too large. Shorten your request and try again.', ctx);
	}

	let body: unknown;
	try {
		body = JSON.parse(raw);
	}
	catch {
		return rejectJson(event, 400, 'BAD_JSON', 'Invalid request body.', ctx);
	}

	const bounded = boundRawMessages((body as { messages?: unknown })?.messages);
	if (bounded.error) {
		return rejectJson(event, 400, 'INVALID_MESSAGES', bounded.error, ctx);
	}

	const validated = await safeValidateUIMessages({ messages: bounded.messages });
	if (!validated.success) {
		return rejectJson(event, 400, 'INVALID_MESSAGES', validated.error?.message || 'Invalid messages.', ctx);
	}

	return { messages: validated.data };
}

export default defineEventHandler(async (event) => {
	const admitted = await assertAdmissible(event);
	if (!isAdmitContext(admitted)) return admitted;

	const parsed = await parseAndValidate(event, admitted);
	if (!('messages' in parsed)) return parsed;

	const limited = await enforceDailyLimits(event, admitted);
	if (!isAdmitContext(limited)) return limited;

	const config = useRuntimeConfig(event);
	const apiKey = config.assistant?.openrouterApiKey;
	if (!apiKey) {
		return rejectJson(event, 503, 'NOT_CONFIGURED', 'AI assistant not configured.', limited);
	}

	const profile = PROFILES[limited.mode];
	const messages = compactMessagesForModel((parsed as { messages: UIMessage[] }).messages, profile.messageLimit);
	const baseURL = config.app?.baseURL || '/';
	const pagePath = await readPagePath(event, baseURL, limited.requestId);
	const sessionId = readSessionId(event);
	const prefs = readUserPrefs(event);
	const finalSystemPrompt = buildSystemPrompt(systemPrompt, pagePath, prefs);

	const abortController = new AbortController();
	let idleTimer: NodeJS.Timeout | undefined;
	const resetIdleTimer = () => {
		if (idleTimer) clearTimeout(idleTimer);
		idleTimer = setTimeout(() => abortController.abort(), 60_000);
	};
	resetIdleTimer();
	event.node.req.on('close', () => abortController.abort());

	const openrouter = createOpenRouter({ apiKey });
	const tools = bindMcpToolsForAI({
		'list-docs': listDocs,
		'get-doc': getDoc,
		'search-docs': searchDocs,
		'search-directus-code': searchDirectusCode,
		'get-directus-file': getDirectusFile,
	}, { maxCalls: 15, maxResultBytes: 50 * 1024, onActivity: resetIdleTimer });

	const stream = createUIMessageStream({
		onError: (error) => {
			console.error('[assistant] stream error', { requestId: limited.requestId, error });
			return 'Assistant is temporarily unavailable. Try again in a few hours.';
		},
		execute: async ({ writer }: { writer: UIMessageStreamWriter }) => {
			writer.write({
				id: `trace-${limited.requestId}`,
				type: 'data-trace-id',
				data: { traceId: limited.requestId },
			});
			const modelMessages = await convertToModelMessages(messages);
			const result = streamText({
				model: openrouter(config.assistant.model),
				system: finalSystemPrompt,
				messages: modelMessages,
				tools: tools as ToolSet,
				stopWhen: stopWhenResponseComplete(profile.maxSteps),
				prepareStep: forceSummaryStep(profile.maxSteps),
				maxOutputTokens: profile.maxOutputTokens,
				maxRetries: 0,
				abortSignal: abortController.signal,
				experimental_telemetry: {
					isEnabled: true,
					recordInputs: true,
					recordOutputs: true,
					functionId: 'docs-assistant-chat',
					metadata: {
						posthog_distinct_id: limited.posthogDistinctId,
						$ai_session_id: sessionId || limited.fingerprint,
						$ai_trace_id: limited.requestId,
						request_id: limited.requestId,
						ip_prefix: limited.ipPrefix,
						fingerprint: limited.fingerprint,
						fingerprint_entropy: limited.fingerprintEntropy,
						page_path: pagePath || '',
						mode: limited.mode,
						gate_verdict: limited.gateVerdict,
						framework: prefs?.framework || '',
					},
				},
				onChunk: resetIdleTimer,
				onFinish: () => {
					if (idleTimer) clearTimeout(idleTimer);
					flushPostHogAiTelemetry(limited.requestId);
				},
				onStepFinish: ({ toolCalls }: { toolCalls: ToolCallPart[] }) => {
					resetIdleTimer();
					if (toolCalls.length === 0) return;
					writer.write({
						id: toolCalls[0]?.toolCallId,
						type: 'data-tool-calls',
						data: {
							tools: toolCalls.map((tc) => {
								const args = 'args' in tc ? (tc as unknown as { args: unknown }).args : 'input' in tc ? (tc as unknown as { input: unknown }).input : {};
								return {
									toolName: tc.toolName,
									toolCallId: tc.toolCallId,
									args,
								};
							}),
						},
					});
				},
			});
			writer.merge(result.toUIMessageStream());
		},
	});

	return createUIMessageStreamResponse({
		stream,
		headers: {
			'X-Request-ID': limited.requestId,
			'X-Assistant-Mode': limited.mode,
			'X-RateLimit-Remaining-Day': String(limited.remainingDay ?? ''),
		},
	});
});
