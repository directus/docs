import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { ofetch } from 'ofetch';
import { useEvent } from 'nitropack/runtime';
import { z } from 'zod';
import { normalizeDocPath, parseMcpMarkdown } from '../../utils/mcpMarkdown';
import { getMcpMarkdownPath, getMcpStaticBaseUrl } from '../../utils/mcpStatic';

const BASE_PATH = '/docs';

export default defineMcpTool({
	name: 'get-doc',
	title: 'Get a Directus doc',
	description:
		'Fetch a single documentation page by its path. Returns title, description, and the full markdown body.',
	inputSchema: {
		path: z
			.string()
			.describe('Page path starting with "/", e.g. "/getting-started/overview".'),
	},
	cache: '10m',
	handler: async ({ path }) => {
		const event = useEvent();
		const config = useRuntimeConfig();
		const siteOrigin = config.public.siteUrl.replace(/\/$/, '');
		const normalized = normalizeDocPath(path);

		let markdown: string;
		try {
			markdown = await ofetch(`${getMcpStaticBaseUrl()}${getMcpMarkdownPath(normalized)}.md`, { responseType: 'text' });
		}
		catch (error) {
			if (!import.meta.dev) {
				if (fetchStatusCode(error) !== 404) {
					throw createError({ statusCode: 503, message: `Doc markdown unavailable for ${normalized}` });
				}
				throw createError({ statusCode: 404, message: `No doc found at ${normalized}` });
			}

			const { queryCollection } = await import('@nuxt/content/server');
			const page = await queryCollection(event, 'content')
				.where('path', '=', normalized)
				.first();

			if (!page) {
				throw createError({ statusCode: 404, message: `No doc found at ${normalized}` });
			}

			return {
				title: page.title,
				path: page.path,
				description: page.description ?? '',
				content: page.rawbody ?? '',
				url: `${siteOrigin}${BASE_PATH}${page.path}`,
			};
		}

		const page = parseMcpMarkdown(markdown, normalized);

		return {
			title: page.title,
			path: normalized,
			description: page.description ?? '',
			content: page.content,
			url: `${siteOrigin}${BASE_PATH}${normalized}`,
		};
	},
});

function fetchStatusCode(error: unknown): number | undefined {
	if (!error || typeof error !== 'object' || !('response' in error)) return;
	return (error as { response?: { status?: number } }).response?.status;
}
