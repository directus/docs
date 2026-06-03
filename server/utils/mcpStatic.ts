import { normalizeDocPath } from './mcpMarkdown';

export function getMcpStaticBaseUrl(): string {
	const config = useRuntimeConfig();
	const baseUrl = config.app.baseURL.replace(/\/$/, '');
	const siteOrigin = config.public.siteUrl.replace(/\/$/, '');
	return `${siteOrigin}${baseUrl}`;
}

export function getMcpMarkdownPath(path: string): string {
	const normalized = normalizeDocPath(path);
	return normalized === '/' ? '/index' : normalized;
}
