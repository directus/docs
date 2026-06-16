import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
	convertToModelMessages,
	createUIMessageStream,
	streamText,
	type ToolCallPart,
	type ToolSet,
	type UIMessage,
	type UIMessageStreamWriter,
} from 'ai';
import type { H3Event } from 'h3';
import type { AssistantAdmitContext } from './admit';
import type { LimitProfile } from './profiles';

type StepContent = { content?: Array<{ type: string; toolName?: string }> };

interface AssistantStreamOptions {
	event: H3Event;
	apiKey: string;
	model: string;
	system: string;
	messages: UIMessage[];
	profile: LimitProfile;
	admit: AssistantAdmitContext;
	sessionId?: string;
	pagePath: string | null;
	framework?: string;
	createTools: (onActivity: () => void) => ToolSet;
}

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

function toolCallArgs(toolCall: ToolCallPart): unknown {
	if ('args' in toolCall) return (toolCall as unknown as { args: unknown }).args;
	if ('input' in toolCall) return (toolCall as unknown as { input: unknown }).input;
	return {};
}

export function createAssistantStream(options: AssistantStreamOptions) {
	const abortController = new AbortController();
	let idleTimer: NodeJS.Timeout | undefined;
	const resetIdleTimer = () => {
		if (idleTimer) clearTimeout(idleTimer);
		idleTimer = setTimeout(() => abortController.abort(), 60_000);
	};
	resetIdleTimer();
	options.event.node.req.on('close', () => abortController.abort());

	const openrouter = createOpenRouter({ apiKey: options.apiKey });
	const tools = options.createTools(resetIdleTimer);

	return createUIMessageStream({
		onError: (error) => {
			console.error('[assistant] stream error', { requestId: options.admit.requestId, error });
			return 'Assistant is temporarily unavailable. Try again in a few hours.';
		},
		execute: async ({ writer }: { writer: UIMessageStreamWriter }) => {
			writer.write({
				id: `trace-${options.admit.requestId}`,
				type: 'data-trace-id',
				data: { traceId: options.admit.requestId },
			});
			const modelMessages = await convertToModelMessages(options.messages);
			const result = streamText({
				model: openrouter(options.model),
				system: options.system,
				messages: modelMessages,
				tools,
				stopWhen: stopWhenResponseComplete(options.profile.maxSteps),
				prepareStep: forceSummaryStep(options.profile.maxSteps),
				maxOutputTokens: options.profile.maxOutputTokens,
				maxRetries: 0,
				abortSignal: abortController.signal,
				experimental_telemetry: {
					isEnabled: true,
					recordInputs: true,
					recordOutputs: true,
					functionId: 'docs-assistant-chat',
					metadata: {
						posthog_distinct_id: options.admit.posthogDistinctId,
						$ai_session_id: options.sessionId || options.admit.fingerprint,
						$ai_trace_id: options.admit.requestId,
						request_id: options.admit.requestId,
						ip_prefix: options.admit.ipPrefix,
						fingerprint: options.admit.fingerprint,
						fingerprint_entropy: options.admit.fingerprintEntropy,
						page_path: options.pagePath || '',
						mode: options.admit.mode,
						gate_verdict: options.admit.gateVerdict,
						framework: options.framework || '',
					},
				},
				onChunk: resetIdleTimer,
				onFinish: () => {
					if (idleTimer) clearTimeout(idleTimer);
					flushPostHogAiTelemetry(options.admit.requestId);
				},
				onStepFinish: ({ toolCalls }: { toolCalls: ToolCallPart[] }) => {
					resetIdleTimer();
					if (toolCalls.length === 0) return;
					writer.write({
						id: toolCalls[0]?.toolCallId,
						type: 'data-tool-calls',
						data: {
							tools: toolCalls.map(toolCall => ({
								toolName: toolCall.toolName,
								toolCallId: toolCall.toolCallId,
								args: toolCallArgs(toolCall),
							})),
						},
					});
				},
			});
			writer.merge(result.toUIMessageStream());
		},
	});
}
