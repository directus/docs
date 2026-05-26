import type { DocsSectionId } from '#shared/utils/docsSections';
import { getTypesenseService } from '~/services/typesenseService';
import type { DocsSearchDocument, DocsSearchItem } from '~/utils/searchResults';
import {
	buildPersonalizedSortBy,
	flattenGroups,
	hasDynamicPersonalization,
} from '~/utils/searchResults';

export default function useDocsSearch() {
	if (import.meta.server) return null;

	const config = useRuntimeConfig();
	const { prefs } = useUserPreferences();
	const query = ref('');
	const section = ref<'all' | DocsSectionId>('all');
	const pending = ref(false);
	const found = ref(0);
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
		found.value = 0;
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
		}
		catch (searchError) {
			if (searchError instanceof Error && searchError.name === 'AbortError') {
				return;
			}
			if (currentRequestId !== requestId) return;
			resetResults();
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
		debouncedSearch();
	});

	onScopeDispose(() => {
		abort();
	});

	return {
		query,
		section,
		pending,
		found,
		items,
		sectionCounts,
		minQueryLength,
		isTooShort,
		clear() {
			abort();
			query.value = '';
			section.value = 'all';
			pending.value = false;
			resetResults();
		},
	};
}
