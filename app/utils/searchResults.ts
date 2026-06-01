import { withoutBase } from 'ufo';
import type {
	TypesenseGroupedHit,
	TypesenseSearchHit,
	TypesenseSearchResult,
} from '~/services/typesenseService';
import type { DocsSectionId } from '#shared/utils/docsSections';
import { docsSections } from '#shared/utils/docsSections';

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

export interface UserSearchPrefs {
	framework?: string | null;
	deployment?: string | null;
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

export function buildSearchItem(
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

export function flattenGroups(result: TypesenseSearchResult<DocsSearchDocument>) {
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

export function hasDynamicPersonalization(prefs: UserSearchPrefs) {
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
export function buildPersonalizedSortBy(prefs: UserSearchPrefs) {
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
