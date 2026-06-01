import { parseTypesenseUrl } from '#shared/utils/parseTypesenseUrl';

export default defineEventHandler(async (event) => {
	if (!import.meta.dev) {
		throw createError({ statusCode: 404, statusMessage: 'Not found' });
	}

	const params = getRouterParams(event).slug;
	const slug = Array.isArray(params) ? params.join('/') : params;
	if (!slug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' });
	}

	const config = useRuntimeConfig();
	if (!config.public.typesenseUrl || !config.public.typesensePublicApiKey || !config.public.typesenseCollection) {
		throw createError({ statusCode: 503, statusMessage: 'Search not configured' });
	}

	const node = parseTypesenseUrl(config.public.typesenseUrl);
	const path = node.path ?? '';
	const baseUrl = `${node.protocol}://${node.host}:${node.port}${path}`;
	const groupId = `/docs/${slug.replace(/^\/+/, '').replace(/\/+$/, '')}`;
	const url = new URL(`${baseUrl}/collections/${config.public.typesenseCollection}/documents/search`);
	url.searchParams.set('q', '*');
	url.searchParams.set('query_by', 'title,heading,content');
	url.searchParams.set('filter_by', `group_id:=${groupId}`);
	url.searchParams.set('sort_by', 'chunk_index:asc');
	url.searchParams.set('per_page', '50');
	url.searchParams.set('include_fields', 'weight,chunk_index,rank_order,search_title,anchor,content,heading,url');

	const result = await $fetch<{
		hits?: Array<{ document: Record<string, unknown> }>;
	}>(url.toString(), {
		headers: {
			'X-TYPESENSE-API-KEY': config.public.typesensePublicApiKey,
		},
	});

	return (result.hits ?? []).map(hit => hit.document);
});
