import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { queryCollection } from '@nuxt/content/server';
import { useEvent } from 'nitropack/runtime';
import { z } from 'zod';

const SITE_ORIGIN = 'https://directus.io';
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
		const normalized = path.startsWith('/') ? path : `/${path}`;

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
			url: `${SITE_ORIGIN}${BASE_PATH}${page.path}`,
		};
	},
});
