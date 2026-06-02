import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { useEvent } from 'nitropack/runtime';
import { z } from 'zod';
import { normalizeDocPath, parseMcpMarkdown } from '../../utils/mcpMarkdown';

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
		const baseUrl = config.app.baseURL.replace(/\/$/, '');
		const normalized = normalizeDocPath(path);

		let markdown: string;
		try {
			markdown = await event.$fetch<string>(`${baseUrl}${normalized}.md`, { responseType: 'text' });
		}
		catch {
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
