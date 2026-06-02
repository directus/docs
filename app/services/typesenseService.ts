import { parseTypesenseUrl } from '#shared/utils/parseTypesenseUrl';

export interface TypesenseSearchState {
	query: string;
	page: number;
	hitsPerPage: number;
	sort?: string;
	filters: Record<string, string[]>;
}

export interface TypesenseSearchConfig {
	query_by: string;
	query_by_weights?: string;
	facet_by?: string;
	sort_by?: string;
	filter_by?: string;
	group_by?: string;
	group_limit?: number;
	include_fields?: string;
	highlight_fields?: string;
	highlight_full_fields?: string;
	prefix?: string | boolean;
	use_cache?: boolean;
}

export interface TypesenseSearchParams {
	indexName: string;
	searchConfig: TypesenseSearchConfig;
	state: TypesenseSearchState;
	/**
	 * Facet attributes that need unfiltered counts. When the user has applied a
	 * filter on one of these attributes, we fire a parallel multi_search query
	 * with that filter removed so the filter widget can still show counts for
	 * unselected values. https://typesense.org/docs/30.2/api/search.html#facet-results
	 */
	facetRefinementAttributes?: string[];
}

export interface TypesenseFacetCount {
	value: string;
	count: number;
	highlighted?: string;
}

export interface TypesenseFacetResults {
	[field: string]: TypesenseFacetCount[];
}

export interface TypesenseSearchHit<TDocument = Record<string, unknown>> {
	document: TDocument;
	highlights?: Array<Record<string, unknown>>;
	highlight?: Record<string, unknown>;
	text_match?: number;
	text_match_info?: Record<string, unknown>;
}

export interface TypesenseGroupedHit<TDocument = Record<string, unknown>> {
	group_key: string[];
	hits: TypesenseSearchHit<TDocument>[];
	found?: number;
}

export interface TypesenseSearchResult<TDocument = Record<string, unknown>> {
	hits: TypesenseSearchHit<TDocument>[];
	grouped_hits?: TypesenseGroupedHit<TDocument>[];
	facets: TypesenseFacetResults;
	found: number;
	search_time_ms: number;
	page: number;
	out_of: number;
}

interface TypesenseServiceOptions {
	typesenseUrl: string;
	typesensePublicApiKey: string;
}

interface TypesenseAPISearchParams {
	q: string;
	query_by: string;
	page: number;
	per_page: number;
	query_by_weights?: string;
	facet_by?: string;
	sort_by?: string;
	filter_by?: string;
	group_by?: string;
	group_limit?: number;
	include_fields?: string;
	highlight_fields?: string;
	highlight_full_fields?: string;
	prefix?: string | boolean;
	use_cache?: boolean;
}

interface RawSearchResponse<TDocument> {
	hits?: TypesenseSearchHit<TDocument>[];
	grouped_hits?: TypesenseGroupedHit<TDocument>[];
	facet_counts?: Array<{ field_name: string; counts: Array<{ value: string; count: number; highlighted?: string }> }>;
	found?: number;
	page?: number;
	out_of?: number;
}

export class TypesenseService {
	private typesenseNode: ReturnType<typeof parseTypesenseUrl>;
	private typesensePublicApiKey: string;

	constructor(options: TypesenseServiceOptions) {
		this.typesenseNode = parseTypesenseUrl(options.typesenseUrl);
		this.typesensePublicApiKey = options.typesensePublicApiKey;
	}

	private get baseUrl() {
		const path = this.typesenseNode.path ?? '';
		return `${this.typesenseNode.protocol}://${this.typesenseNode.host}:${this.typesenseNode.port}${path}`;
	}

	private buildSearchParams({ searchConfig, state }: TypesenseSearchParams, excludeFilterAttribute?: string): TypesenseAPISearchParams {
		const params: TypesenseAPISearchParams = {
			q: state.query || '*',
			query_by: searchConfig.query_by,
			page: state.page,
			per_page: state.hitsPerPage,
		};

		if (searchConfig.query_by_weights) params.query_by_weights = searchConfig.query_by_weights;
		if (searchConfig.facet_by) params.facet_by = searchConfig.facet_by;
		if (state.sort) params.sort_by = state.sort;
		else if (searchConfig.sort_by) params.sort_by = searchConfig.sort_by;
		if (searchConfig.group_by) params.group_by = searchConfig.group_by;
		if (searchConfig.group_limit) params.group_limit = searchConfig.group_limit;
		if (searchConfig.include_fields) params.include_fields = searchConfig.include_fields;
		if (searchConfig.highlight_fields) params.highlight_fields = searchConfig.highlight_fields;
		if (searchConfig.highlight_full_fields) params.highlight_full_fields = searchConfig.highlight_full_fields;
		if (searchConfig.prefix !== undefined) params.prefix = searchConfig.prefix;
		if (searchConfig.use_cache !== undefined) params.use_cache = searchConfig.use_cache;

		const filterParts: string[] = [];
		if (searchConfig.filter_by) filterParts.push(searchConfig.filter_by);
		for (const [attribute, values] of Object.entries(state.filters)) {
			if (values.length === 0 || attribute === excludeFilterAttribute) continue;
			const clause = values.map(value => `${attribute}:=${value}`).join(' || ');
			filterParts.push(`(${clause})`);
		}
		if (filterParts.length > 0) params.filter_by = filterParts.join(' && ');

		return params;
	}

	private toFacets(facetCounts: RawSearchResponse<unknown>['facet_counts']): TypesenseFacetResults {
		const facets: TypesenseFacetResults = {};
		for (const facetCount of facetCounts ?? []) {
			facets[facetCount.field_name] = facetCount.counts.map(count => ({
				value: count.value,
				count: count.count,
				highlighted: count.highlighted,
			}));
		}
		return facets;
	}

	async search<TDocument = Record<string, unknown>>(
		params: TypesenseSearchParams,
		signal?: AbortSignal,
	): Promise<TypesenseSearchResult<TDocument>> {
		const requestStartTime = performance.now();
		const refinementAttributes = (params.facetRefinementAttributes ?? [])
			.filter(attribute => params.state.filters[attribute]?.length);

		if (refinementAttributes.length === 0) {
			const apiParams = this.buildSearchParams(params);
			const url = new URL(`${this.baseUrl}/collections/${params.indexName}/documents/search`);
			for (const [key, value] of Object.entries(apiParams)) {
				url.searchParams.append(key, String(value));
			}

			const response = await $fetch<RawSearchResponse<TDocument>>(url.toString(), {
				headers: { 'X-TYPESENSE-API-KEY': this.typesensePublicApiKey },
				signal,
			});

			return {
				hits: response.hits ?? [],
				grouped_hits: response.grouped_hits ?? [],
				facets: this.toFacets(response.facet_counts),
				found: response.found ?? 0,
				search_time_ms: Math.round(performance.now() - requestStartTime),
				page: response.page ?? 1,
				out_of: response.out_of ?? 0,
			};
		}

		// Refinement path: fire the main search + one facet-only search per
		// refinement attribute (each with that attribute's filter removed) in a
		// single multi_search request, then merge the facet counts back.
		const searches: Array<TypesenseAPISearchParams & { collection: string }> = [
			{ ...this.buildSearchParams(params), collection: params.indexName },
		];
		for (const attribute of refinementAttributes) {
			searches.push({
				...this.buildSearchParams(params, attribute),
				collection: params.indexName,
				facet_by: attribute,
				per_page: 0,
			});
		}

		const response = await $fetch<{ results: RawSearchResponse<TDocument>[] }>(`${this.baseUrl}/multi_search`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-TYPESENSE-API-KEY': this.typesensePublicApiKey,
			},
			body: { searches },
			signal,
		});

		const main = response.results[0]!;
		const facets = this.toFacets(main.facet_counts);
		for (const [index, attribute] of refinementAttributes.entries()) {
			const refinement = response.results[index + 1];
			const refinementCount = refinement?.facet_counts?.find(entry => entry.field_name === attribute);
			if (refinementCount) {
				facets[attribute] = refinementCount.counts.map(count => ({
					value: count.value,
					count: count.count,
					highlighted: count.highlighted,
				}));
			}
		}

		return {
			hits: main.hits ?? [],
			grouped_hits: main.grouped_hits ?? [],
			facets,
			found: main.found ?? 0,
			search_time_ms: Math.round(performance.now() - requestStartTime),
			page: main.page ?? 1,
			out_of: main.out_of ?? 0,
		};
	}
}

let typesenseService: TypesenseService | null = null;

export function getTypesenseService(options?: TypesenseServiceOptions) {
	if (!typesenseService) {
		if (!options) throw new Error('getTypesenseService: first call requires options');
		typesenseService = new TypesenseService(options);
	}

	return typesenseService;
}
