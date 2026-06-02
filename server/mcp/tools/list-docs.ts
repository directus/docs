import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { ofetch } from 'ofetch';
import { useEvent } from 'nitropack/runtime';
import { z } from 'zod';
import { docsSections } from '#shared/utils/docsSections';
import { getMcpStaticBaseUrl } from '../../utils/mcpStatic';

const BASE_PATH = '/docs';

const allPrefixes = Array.from(new Set(docsSections.flatMap(s => s.prefixes))).sort();
const prefixDescription = `Path prefix to filter by. Must start with "/". Valid prefixes: ${allPrefixes.join(', ')}.`;

interface McpDocIndexEntry {
	title: string;
	path: string;
	description: string;
}

export default defineMcpTool({
	name: 'list-docs',
	title: 'List Directus docs',
	description:
		'List documentation pages with title, path, description, and URL. Use this to discover available docs when you do not know exact paths.',
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
		const config = useRuntimeConfig();
		const siteOrigin = config.public.siteUrl.replace(/\/$/, '');
		const rows = await loadDocIndex(event);
		const filtered = pathPrefix
			? rows.filter(row => row.path.startsWith(pathPrefix))
			: rows;

		return filtered.slice(0, limit ?? 200).map(row => ({
			title: row.title,
			path: row.path,
			description: row.description ?? '',
			url: `${siteOrigin}${BASE_PATH}${row.path}`,
		}));
	},
});

async function loadDocIndex(event: ReturnType<typeof useEvent>): Promise<McpDocIndexEntry[]> {
	try {
		return await ofetch<McpDocIndexEntry[]>(`${getMcpStaticBaseUrl(event)}/mcp-docs-index.json`);
	}
	catch {
		if (!import.meta.dev) {
			throw createError({ statusCode: 503, message: 'Docs index unavailable' });
		}

		const { queryCollection } = await import('@nuxt/content/server');
		const rows = await queryCollection(event, 'content')
			.where('path', 'NOT LIKE', '%/.%')
			.where('path', 'NOT LIKE', '%/_partials/%')
			.order('path', 'ASC')
			.all();

		return rows.map(row => ({
			title: row.title,
			path: row.path,
			description: row.description ?? '',
		}));
	}
}
