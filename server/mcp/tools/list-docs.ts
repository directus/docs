import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { queryCollection } from '@nuxt/content/server';
import { useEvent } from 'nitropack/runtime';
import { z } from 'zod';
import { docsSections } from '#shared/utils/docsSections';

const SITE_ORIGIN = 'https://directus.io';
const BASE_PATH = '/docs';

const allPrefixes = Array.from(new Set(docsSections.flatMap(s => s.prefixes))).sort();
const prefixDescription = `Path prefix to filter by. Must start with "/". Valid prefixes: ${allPrefixes.join(', ')}.`;

export default defineMcpTool({
	name: 'list-docs',
	title: 'List Directus docs',
	description:
		'List documentation pages with title, path, description, and section. Use this to discover available docs when you do not know exact paths.',
	inputSchema: {
		pathPrefix: z
			.string()
			.refine(value => value.startsWith('/'), 'pathPrefix must start with "/"')
			.optional()
			.describe(prefixDescription),
		limit: z.number().int().min(1).max(500).optional().describe('Max results (default 200).'),
	},
	cache: '10m',
	handler: async ({ pathPrefix, limit }) => {
		const event = useEvent();
		let query = queryCollection(event, 'content')
			.where('path', 'NOT LIKE', '%/.%')
			.where('path', 'NOT LIKE', '%/_partials/%')
			.order('path', 'ASC');

		if (pathPrefix) {
			query = query.where('path', 'LIKE', `${pathPrefix}%`);
		}

		const rows = await query.limit(limit ?? 200).all();

		return rows.map(row => ({
			title: row.title,
			path: row.path,
			description: row.description ?? '',
			url: `${SITE_ORIGIN}${BASE_PATH}${row.path}`,
		}));
	},
});
