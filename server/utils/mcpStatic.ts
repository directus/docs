import { getRequestURL, type H3Event } from 'h3';
import { normalizeDocPath } from './mcpMarkdown';

export function getMcpStaticBaseUrl(event: H3Event): string {
	const config = useRuntimeConfig();
	const baseUrl = config.app.baseURL.replace(/\/$/, '');
	const requestUrl = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
	return `${requestUrl.origin}${baseUrl}`;
}

export function getMcpMarkdownPath(path: string): string {
	const normalized = normalizeDocPath(path);
	return normalized === '/' ? '/index' : normalized;
}
