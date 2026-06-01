import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { ofetch } from 'ofetch';
import { z } from 'zod';
import { docsSections } from '#shared/utils/docsSections';
import { frameworks } from '#shared/utils/frameworks';
import { parseTypesenseUrl } from '#shared/utils/parseTypesenseUrl';

const SITE_ORIGIN = 'https://directus.io';
const BASE_PATH = '/docs';

const sectionIds = docsSections.map(s => s.id) as [string, ...string[]];
const frameworkSlugs = frameworks.map(f => f.slug) as [string, ...string[]];

interface TypesenseHit {
	document: {
		group_id?: string;
		url?: string;
		title?: string;
		search_title?: string;
		description?: string;
		heading?: string;
		anchor?: string;
		content?: string;
		section?: string;
		doc_type?: string;
		technologies?: string[];
	};
	highlight?: {
		content?: { snippet?: string };
	};
}

export default defineMcpTool({
	name: 'search-docs',
	title: 'Search Directus docs',
	description:
		'Full-text search across the Directus documentation. Returns ranked results with title, path, snippet, and section. Use this when you do not know the exact path of the doc you need.',
	inputSchema: {
		query: z.string().min(1).describe('Search query.'),
		section: z
			.enum(sectionIds)
			.optional()
			.describe('Optional section facet to narrow results.'),
		framework: z
			.enum(frameworkSlugs)
			.optional()
			.describe('Optional framework filter to return only framework-specific docs.'),
		limit: z.number().int().min(1).max(20).optional().describe('Max results (default 8).'),
	},
	cache: '5m',
	handler: async ({ query, section, framework, limit }) => {
		const config = useRuntimeConfig();

		if (!config.public.typesenseUrl || !config.public.typesensePublicApiKey || !config.public.typesenseCollection) {
			throw createError({ statusCode: 503, message: 'Search backend not configured' });
		}

		const node = parseTypesenseUrl(config.public.typesenseUrl);
		const path = node.path ?? '';
		const baseUrl = `${node.protocol}://${node.host}:${node.port}${path}`;
		const url = new URL(`${baseUrl}/collections/${config.public.typesenseCollection}/documents/search`);

		url.searchParams.set('q', query);
		url.searchParams.set('query_by', 'search_title,heading,content');
		url.searchParams.set('query_by_weights', '4,2,1');
		url.searchParams.set('group_by', 'group_id');
		url.searchParams.set('group_limit', '1');
		url.searchParams.set('per_page', String(limit ?? 8));
		url.searchParams.set('include_fields', 'group_id,url,title,search_title,description,heading,anchor,section,doc_type,technologies,content');
		url.searchParams.set('highlight_fields', 'content');
		url.searchParams.set('highlight_affix_num_tokens', '8');

		const filters: string[] = [];
		if (section) filters.push(`section:=${section}`);
		if (framework) filters.push(`technologies:=[${framework}]`);
		if (filters.length) url.searchParams.set('filter_by', filters.join(' && '));

		const result = await ofetch<{
			grouped_hits?: Array<{ hits: TypesenseHit[] }>;
			hits?: TypesenseHit[];
		}>(url.toString(), {
			headers: { 'X-TYPESENSE-API-KEY': config.public.typesensePublicApiKey },
		});

		const hits: TypesenseHit[] = result.grouped_hits
			? result.grouped_hits.map(g => g.hits[0]).filter(Boolean) as TypesenseHit[]
			: result.hits ?? [];

		return hits.map((hit) => {
			const doc = hit.document;
			const groupPath = doc.group_id ?? '';
			const docPath = groupPath.startsWith(BASE_PATH) ? groupPath.slice(BASE_PATH.length) : groupPath;
			const rawUrl = doc.url || `${docPath}${doc.anchor ? `#${doc.anchor}` : ''}`;
			const url = rawUrl.startsWith('http')
				? rawUrl
				: `${SITE_ORIGIN}${rawUrl.startsWith('/') ? '' : BASE_PATH}${rawUrl}`;
			return {
				title: doc.search_title || doc.title || '',
				heading: doc.heading,
				path: docPath,
				url,
				description: doc.description ?? '',
				section: doc.section,
				docType: doc.doc_type,
				technologies: doc.technologies,
				snippet: hit.highlight?.content?.snippet || (doc.content ?? '').slice(0, 200),
			};
		});
	},
});
