import type { H3Event } from 'h3';

export type AssistantRuntimeContext = 'production' | 'preview' | 'development';

export function getAssistantRuntimeContext(event?: H3Event): AssistantRuntimeContext {
	if (process.env.VERCEL_ENV === 'production') return 'production';
	if (process.env.VERCEL_ENV === 'preview') return 'preview';

	const host = event ? getHeader(event, 'host') || '' : '';
	if (host.startsWith('localhost:') || host.startsWith('127.0.0.1:')) return 'development';
	if (process.env.NODE_ENV !== 'production') return 'development';

	return 'preview';
}

export function isDevContext(event?: H3Event): boolean {
	return getAssistantRuntimeContext(event) === 'development';
}
