import { afterEach, describe, expect, it, vi } from 'vitest';
import { TypesenseService } from '../../app/services/typesenseService';

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('TypesenseService', () => {
	it('uses multi_search to merge unfiltered facet counts for refinements', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			results: [
				{
					hits: [{ document: { id: '1', title: 'Auth' } }],
					facet_counts: [{ field_name: 'section', counts: [{ value: 'guides', count: 1 }] }],
					found: 1,
					page: 1,
					out_of: 1,
				},
				{
					facet_counts: [{ field_name: 'section', counts: [{ value: 'guides', count: 3 }, { value: 'api', count: 2 }] }],
				},
			],
		});
		vi.stubGlobal('$fetch', fetchMock);

		const service = new TypesenseService({
			typesenseUrl: 'https://search.example.com/typesense',
			typesensePublicApiKey: 'public-key',
		});

		const result = await service.search({
			indexName: 'directus-docs',
			searchConfig: {
				query_by: 'title,content',
				facet_by: 'section',
				filter_by: 'doc_type:=page',
			},
			state: {
				query: 'auth',
				page: 1,
				hitsPerPage: 10,
				filters: { section: ['guides'] },
			},
			facetRefinementAttributes: ['section'],
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'https://search.example.com:443/typesense/multi_search',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ 'X-TYPESENSE-API-KEY': 'public-key' }),
			}),
		);
		const request = fetchMock.mock.calls[0]?.[1];
		expect(request.body.searches).toHaveLength(2);
		expect(request.body.searches[0].filter_by).toBe('doc_type:=page && (section:=guides)');
		expect(request.body.searches[1].filter_by).toBe('doc_type:=page');
		expect(request.body.searches[1].per_page).toBe(0);
		expect(result.facets.section).toEqual([
			{ value: 'guides', count: 3, highlighted: undefined },
			{ value: 'api', count: 2, highlighted: undefined },
		]);
	});
});
