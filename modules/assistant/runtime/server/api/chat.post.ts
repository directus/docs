import {
	createUIMessageStreamResponse,
	type ToolSet,
} from 'ai';
import getDirectusFile from '~~/server/mcp/tools/get-directus-file';
import getDirectusPage from '~~/server/mcp/tools/get-directus-page';
import getDoc from '~~/server/mcp/tools/get-doc';
import listDocs from '~~/server/mcp/tools/list-docs';
import searchDirectusCode from '~~/server/mcp/tools/search-directus-code';
import searchDocs from '~~/server/mcp/tools/search-docs';
import { admitChat } from '../utils/admit';
import { bindMcpToolsForAI } from '../utils/bind-tools';
import { PROFILES } from '../utils/profiles';
import { buildRequestContext } from '../utils/request-context';
import { createAssistantStream } from '../utils/stream';
import { systemPrompt } from '../../../prompts/system-prompt';

export default defineEventHandler(async (event) => {
	const admission = await admitChat(event);
	if (!admission.ok) return admission.body;
	const { ctx: limited, messages: admittedMessages } = admission;

	const config = useRuntimeConfig(event);
	const apiKey = config.assistant?.openrouterApiKey;
	if (!apiKey) {
		setResponseStatus(event, 503);
		return { code: 'NOT_CONFIGURED', message: 'AI assistant not configured.', requestId: limited.requestId };
	}

	const profile = PROFILES[limited.mode];
	const request = await buildRequestContext({
		event,
		baseURL: config.app?.baseURL || '/',
		basePrompt: systemPrompt,
		requestId: limited.requestId,
		messages: admittedMessages,
		profile,
	});

	const stream = createAssistantStream({
		event,
		apiKey,
		model: config.assistant.model,
		system: request.systemPrompt,
		messages: request.messages,
		profile,
		admit: limited,
		sessionId: request.sessionId,
		pagePath: request.pagePath,
		framework: request.framework,
		createTools: onActivity => bindMcpToolsForAI({
			'list-docs': listDocs,
			'get-doc': getDoc,
			'search-docs': searchDocs,
			'search-directus-code': searchDirectusCode,
			'get-directus-file': getDirectusFile,
			'get-directus-page': getDirectusPage,
		}, { maxCalls: 15, maxResultBytes: 50 * 1024, onActivity }) as ToolSet,
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
