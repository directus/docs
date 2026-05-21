import { withoutBase } from 'ufo';
import type {
	TypesenseGroupedHit,
	TypesenseSearchHit,
	TypesenseSearchResult,
} from '~/services/typesenseService';
import type { DocsSectionId } from '#shared/utils/docsSections';
import { docsSections } from '#shared/utils/docsSections';
import { getTypesenseService } from '~/services/typesenseService';

export interface DocsSearchDocument {
	id: string;
	group_id: string;
	url: string;
	title: string;
	search_title: string;
	description?: string;
	anchor?: string;
	heading?: string;
	hierarchy: string[];
	path_tokens: string;
	path_depth: number;
	rank_order: number;
	section: DocsSectionId;
	doc_type: 'page' | 'api-operation' | 'api-tag';
	technologies?: string[];
	content: string;
	code_blocks?: string[];
	weight: number;
	chunk_index: number;
}

export interface DocsSearchItem {
	id: string;
	to: string;
	title: string;
	titleHtml?: string;
	breadcrumb: string;
	snippetHtml?: string;
	content: string;
	description?: string;
	matchedHeadings: string[];
	section: DocsSectionId;
	sectionLabel: string;
	framework?: string;
	docTypeLabel: string;
	docType: DocsSearchDocument['doc_type'];
}

function clipSnippet(value: string, limit = 140) {
	if (value.length <= limit) return value;
	return `${value.slice(0, limit - 1).trimEnd()}…`;
}

function normalizeSnippet(value: string) {
	return value.replace(/\s+/g, ' ').trim();
}

function getHighlightMap(hit: TypesenseSearchHit<DocsSearchDocument>) {
	const entries = Array.isArray(hit.highlights) ? hit.highlights : [];
	const highlights = new Map<string, string>();
	for (const entry of entries) {
		const field = typeof entry.field === 'string' ? entry.field : typeof entry.field === 'number' ? String(entry.field) : '';
		const snippet = typeof entry.snippet === 'string'
			? entry.snippet
			: Array.isArray(entry.snippets) && typeof entry.snippets[0] === 'string'
				? entry.snippets[0]
				: '';
		if (field && snippet) highlights.set(field, snippet);
	}
	return highlights;
}

function getSectionLabel(sectionId: DocsSectionId) {
	return docsSections.find(section => section.id === sectionId)?.label ?? sectionId;
}

function getDocTypeLabel(document: DocsSearchDocument) {
	if (document.doc_type.startsWith('api-') || document.section === 'api' || document.section === 'reference') {
		return 'Reference';
	}
	if (document.section === 'tutorials') {
		return 'Tutorial';
	}
	return 'Guide';
}

function normalizeResultUrl(url: string) {
	if (!url.startsWith('/docs')) return url;
	return withoutBase(url, '/docs') || '/';
}

function buildSearchItem(
	displayHit: TypesenseSearchHit<DocsSearchDocument>,
	{
		targetHit = displayHit,
		matchedHeadings = [],
	}: {
		targetHit?: TypesenseSearchHit<DocsSearchDocument>;
		matchedHeadings?: string[];
	} = {},
) {
	const document = displayHit.document;
	const targetDocument = targetHit.document;
	const displayHighlights = getHighlightMap(displayHit);
	const targetHighlights = getHighlightMap(targetHit);
	const displayTitle = document.title;
	const titleHtml = displayHighlights.get('title');
	const snippetHtml = targetHighlights.get('content') || displayHighlights.get('content');
	const breadcrumb = document.hierarchy.filter(h => h !== displayTitle).join(' › ');
	const content = clipSnippet(normalizeSnippet(targetDocument.content), 400);
	const description = document.description?.trim() || undefined;

	return {
		id: document.id,
		to: normalizeResultUrl(targetDocument.url),
		title: displayTitle,
		titleHtml,
		breadcrumb,
		snippetHtml,
		content,
		description,
		matchedHeadings,
		section: document.section,
		sectionLabel: getSectionLabel(document.section),
		framework: document.technologies?.[0],
		docTypeLabel: getDocTypeLabel(document),
		docType: document.doc_type,
	} satisfies DocsSearchItem;
}

function getDisplayHit(group: TypesenseGroupedHit<DocsSearchDocument>) {
	return group.hits.find(hit => hit.document.chunk_index === 0 && !hit.document.anchor)
		?? group.hits.find(hit => !hit.document.anchor)
		?? group.hits[0]!;
}

function flattenGroups(result: TypesenseSearchResult<DocsSearchDocument>) {
	if (result.grouped_hits?.length) {
		return result.grouped_hits.map((group: TypesenseGroupedHit<DocsSearchDocument>) => {
			const primaryHit = group.hits[0]!;
			const displayHit = getDisplayHit(group);
			const matchedHeadings = [...new Set(group.hits
				.map(hit => hit.document.heading?.trim())
				.filter((heading): heading is string => Boolean(heading))
				.filter(heading => heading !== displayHit.document.search_title && heading !== displayHit.document.title))];
			return buildSearchItem(displayHit, { targetHit: primaryHit, matchedHeadings });
		});
	}
	return result.hits.map(hit => buildSearchItem(hit));
}

/**
 * Soft section boosts for docs search.
 *
 * We intentionally keep this as optional re-ranking via `_eval(...)`, not
 * filtering or pinning, so strong text matches can still win.
 *
 * Typesense refs:
 * - Ranking / optional boosts: https://typesense.org/docs/guide/ranking-and-relevance.html
 * - Personalization: https://typesense.org/docs/guide/personalization.html
 * Section priority used for both Typesense ranking boosts and chip-bar
 * ordering in the palette. Sections not listed here render after the listed
 * ones in their docsSections order.
 *
 * Weights are relative only. Keep guides, api, and frameworks near the top,
 * while still letting `_text_match(buckets: 10)` win on strong matches.
 */
export const sectionPriority: Array<{ id: DocsSectionId; weight: number }> = [
	{ id: 'guides', weight: 6 },
	{ id: 'api', weight: 6 },
	{ id: 'frameworks', weight: 5 },
	{ id: 'reference', weight: 3 },
	{ id: 'getting-started', weight: 2 },
];

function buildSectionBoostClauses() {
	return sectionPriority.map(({ id, weight }) => `(section:=${id}):${weight}`);
}

function hasDynamicPersonalization(prefs: ReturnType<typeof useUserPreferences>['prefs']['value']) {
	return Boolean(prefs.framework || prefs.deployment === 'cloud');
}

/**
 * Build the Typesense `sort_by` expression for docs search.
 *
 * Why this shape:
 * - `_text_match(buckets: 10):desc` keeps text relevance first, while still
 *   allowing later clauses to re-rank near-ties within buckets.
 * - framework-specific clauses come before generic section clauses so a
 *   preferred framework can beat broad `frameworks` boosting.
 * - `_eval([...])` is used for soft boosts only. We don't hide results.
 *
 * Typesense refs:
 * - Search params: https://typesense.org/docs/30.2/api/search.html
 * - Relevance / buckets: https://typesense.org/docs/guide/ranking-and-relevance.html
 * - Personalization: https://typesense.org/docs/guide/personalization.html
 */
function buildPersonalizedSortBy(prefs: ReturnType<typeof useUserPreferences>['prefs']['value']) {
	const clauses: string[] = [];

	if (prefs.framework) {
		clauses.push(`(section:=frameworks && technologies:=${prefs.framework}):10`);
		clauses.push(`(technologies:=${prefs.framework}):3`);
	}
	if (prefs.deployment === 'cloud') {
		clauses.push('(section:=guides):1');
	}

	clauses.push(...buildSectionBoostClauses());

	return `_text_match(buckets: 10):desc,_eval([${clauses.join(', ')}]):desc,rank_order:asc`;
}

export default function useDocsSearch() {
	if (import.meta.server) return null;

	const config = useRuntimeConfig();
	const { prefs } = useUserPreferences();
	const query = ref('');
	const section = ref<'all' | DocsSectionId>('all');
	const pending = ref(false);
	const error = ref<string | null>(null);
	const found = ref(0);
	const searchTimeMs = ref(0);
	const items = ref<DocsSearchItem[]>([]);
	const sectionCounts = ref(new Map<DocsSectionId, number>());
	if (!config.public.typesenseUrl || !config.public.typesensePublicApiKey || !config.public.typesenseCollection) {
		console.warn('[search] Typesense env not configured. Search disabled.');
		return null;
	}

	const service = getTypesenseService({
		typesenseUrl: config.public.typesenseUrl,
		typesensePublicApiKey: config.public.typesensePublicApiKey,
	});

	/* Two chars keeps the palette responsive for short docs terms like `ai`, while still avoiding the noisy / jarring 1-character search state. */
	const minQueryLength = 2;
	const isTooShort = computed(() => {
		const currentQuery = query.value.trim();
		return currentQuery.length > 0 && currentQuery.length < minQueryLength;
	});
	let abortController: AbortController | null = null;
	let requestId = 0;

	function abort() {
		abortController?.abort();
		abortController = null;
	}

	function resetResults() {
		error.value = null;
		found.value = 0;
		searchTimeMs.value = 0;
		items.value = [];
		sectionCounts.value = new Map();
	}

	async function runSearch() {
		const currentQuery = query.value.trim();
		if (currentQuery.length < minQueryLength) {
			abort();
			pending.value = false;
			resetResults();
			return;
		}

		const currentRequestId = ++requestId;
		abort();
		abortController = new AbortController();
		pending.value = true;
		error.value = null;

		try {
			const sortBy = buildPersonalizedSortBy(prefs.value);
			const result = await service.search<DocsSearchDocument>({
				indexName: config.public.typesenseCollection,
				searchConfig: {
					/*
					Search across both page-level and chunk-level fields. We group by
					`group_id` below so Typesense can rank by the best matching chunk,
					while the UI still renders a single page-level result.

					`search_title` and `title` are weighted highest because they best
					reflect page intent. `content` and `code_blocks` stay searchable,
					but lower, so exact body snippets don't dominate broad queries.
					*/
					query_by: 'search_title,title,heading,hierarchy,path_tokens,content,code_blocks',
					query_by_weights: '10,8,6,5,4,3,2',
					sort_by: sortBy,
					/*
					Collapse chunks from the same page into one result. `group_id` is
					assigned per page during indexing.
					*/
					group_by: 'group_id',
					/*
					Keep the top 3 hits per page so matched headings stay available
					without inflating the result count.
					*/
					group_limit: 3,
					/*
					Section counts power the footer chip bar. One facet keeps the
					refinement multi_search cheap.
					*/
					facet_by: 'section',
					/*
					Use snippet highlights for content previews.
					*/
					highlight_fields: 'search_title,title,heading,content',
					/*
					Identical list is intentional. Full highlights are used for
					title, heading, and search_title rendering paths.
					*/
					highlight_full_fields: 'search_title,title,heading,content',
					/*
					Trim the payload to fields used by buildSearchItem and
					flattenGroups.
					*/
					include_fields: 'id,group_id,url,title,search_title,description,anchor,heading,hierarchy,path_tokens,path_depth,rank_order,section,doc_type,technologies,content,weight,chunk_index',
					/*
					Personalized sort clauses change per user, so only cache when the
					query shape stays stable.
					*/
					use_cache: !hasDynamicPersonalization(prefs.value),
				},
				state: {
					query: currentQuery,
					page: 1,
					hitsPerPage: 12,
					sort: sortBy,
					filters: section.value === 'all' ? {} : { section: [section.value] },
				},
				facetRefinementAttributes: ['section'],
			}, abortController.signal);

			if (currentRequestId !== requestId) return;

			items.value = flattenGroups(result);
			sectionCounts.value = new Map(
				(result.facets.section ?? [])
					.map(entry => [entry.value as DocsSectionId, entry.count] as const),
			);
			/* When a section filter is active, `result.found` is the filtered count. Sum the unfiltered facet counts so the "All" chip shows a stable cross-section total regardless of selection. */
			found.value = section.value === 'all'
				? result.found
				: [...sectionCounts.value.values()].reduce((sum, n) => sum + n, 0);
			searchTimeMs.value = result.search_time_ms;
		}
		catch (searchError) {
			if (searchError instanceof Error && searchError.name === 'AbortError') {
				return;
			}
			if (currentRequestId !== requestId) return;
			resetResults();
			error.value = searchError instanceof Error ? searchError.message : 'Search failed';
		}
		finally {
			if (currentRequestId === requestId) {
				pending.value = false;
			}
		}
	}

	/* Small debounce to avoid spamming Typesense while still feeling instant. */
	const debouncedSearch = useDebounceFn(runSearch, 150);

	watch([
		query,
		section,
		() => prefs.value.framework,
		() => prefs.value.deployment,
	], () => {
		const currentQuery = query.value.trim();
		if (currentQuery.length < minQueryLength) {
			abort();
			pending.value = false;
			resetResults();
			return;
		}

		pending.value = true;
		error.value = null;
		debouncedSearch();
	});

	onScopeDispose(() => {
		abort();
	});

	return {
		query,
		section,
		pending,
		error,
		found,
		searchTimeMs,
		items,
		sectionCounts,
		minQueryLength,
		isTooShort,
		runSearch,
		clear() {
			abort();
			query.value = '';
			section.value = 'all';
			pending.value = false;
			resetResults();
		},
	};
}
