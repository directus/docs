/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { ofetch } from 'ofetch';
import { z } from 'zod';
import { checkRateLimit } from '../../utils/rate-limit';
import { DIRECTUS_REPO_SLUGS, directusRepoSearchQualifier } from '../../utils/directus-repos';

async function fetchWithRetry<T>(url: string, opts: any, retries = 1): Promise<T> {
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await ofetch<T>(url, opts);
		}
		catch (err: any) {
			const status = err?.response?.status;
			const retryable = !status || status >= 500 || status === 429;
			if (!retryable || attempt === retries) throw err;
			await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
		}
	}
	throw new Error('unreachable');
}

interface GhCodeSearchItem {
	path: string;
	html_url: string;
	repository: { full_name: string };
	text_matches?: Array<{
		fragment: string;
		matches?: Array<{ indices: [number, number] }>;
	}>;
}

interface GhCodeSearchResponse {
	total_count: number;
	incomplete_results: boolean;
	items: GhCodeSearchItem[];
}

export default defineMcpTool({
	name: 'search-directus-code',
	title: 'Search Directus source code',
	description:
		'Search source code across Directus org GitHub repos via the GitHub Code Search API. Returns file paths and matching snippets. Follow up with `get-directus-file` to read full files.',
	inputSchema: {
		query: z
			.string()
			.min(1)
			.describe('Search query. Supports GitHub code search syntax (e.g. quoted phrases, `language:ts`).'),
		repo: z
			.enum(DIRECTUS_REPO_SLUGS)
			.default('directus')
			.describe('Allowlisted Directus repo. Defaults to `directus` (core). Note: `@directus/sdk` and `@directus/extensions-sdk` live inside the `directus` monorepo — use `path:packages/sdk` or `path:packages/extensions-sdk` as a path filter within that repo.'),
		language: z
			.string()
			.optional()
			.describe('Filter by language (e.g. "ts", "vue", "sql").'),
		path: z
			.string()
			.optional()
			.describe('Filter by file path glob (e.g. "api/src").'),
		limit: z
			.number()
			.int()
			.min(1)
			.max(20)
			.optional()
			.describe('Max results (default 10).'),
	},
	cache: '5m',
	handler: async ({ query, repo, language, path, limit }) => {
		if (!process.env.GITHUB_TOKEN) {
			throw createError({
				statusCode: 503,
				message: 'GITHUB_TOKEN is required for code search.',
			});
		}

		// Intentionally global to protect the shared GITHUB_TOKEN.
		const localLimit = await checkRateLimit('search-directus-code', { max: 20, windowSeconds: 60, onStoreError: 'deny' });
		if (!localLimit.ok) {
			throw createError({
				statusCode: 429,
				message: 'Local rate limit reached for code search.',
				data: { retryAfter: localLimit.retryAfter },
			});
		}

		const safeQuery = query.replace(/\b(?:repo|org|user):\S+/gi, '').trim();
		const parts = [directusRepoSearchQualifier(repo), safeQuery || 'Directus'];
		if (language) parts.push(`language:${language}`);
		if (path) parts.push(`path:${path}`);
		const q = parts.join(' ');

		let res: GhCodeSearchResponse;
		try {
			res = await fetchWithRetry<GhCodeSearchResponse>('https://api.github.com/search/code', {
				query: { q, per_page: limit ?? 10 },
				headers: {
					'Accept': 'application/vnd.github.text-match+json',
					'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
					'User-Agent': 'directus-docs-mcp',
					'X-GitHub-Api-Version': '2022-11-28',
				},
			});
		}
		catch (err: any) {
			const status = err?.response?.status ?? err?.statusCode ?? 0;
			const retryAfter = Number(err?.response?.headers?.get?.('retry-after')) || 60;
			const map: Record<number, { code: number; msg: string }> = {
				403: { code: 429, msg: 'GitHub code search rate limit hit.' },
				429: { code: 429, msg: 'GitHub code search rate limit hit.' },
				422: { code: 400, msg: 'Invalid search query syntax.' },
			};
			const m = map[status] ?? (status >= 500 || !status
				? { code: 503, msg: 'GitHub code search temporarily unavailable.' }
				: { code: 502, msg: 'GitHub code search failed.' });
			throw createError({ statusCode: m.code, message: m.msg, data: { retryAfter, query: q } });
		}

		if (res.total_count === 0) {
			return {
				query: q,
				totalCount: 0,
				incompleteResults: false,
				hits: [],
				hint: 'No matches. Try fewer or quoted keywords, drop language/path filters, or use search-docs for prose-style questions.',
			};
		}

		const hits = res.items.map((item) => {
			const fullName = item.repository.full_name;
			const repoName = fullName.startsWith('directus/') ? fullName.slice('directus/'.length) : fullName;
			const snippet = item.text_matches?.map(m => m.fragment).join('\n---\n') ?? '';
			return {
				repo: repoName,
				path: item.path,
				url: item.html_url,
				snippet: `<tool_result repo="${repoName}" path="${item.path}">\n${snippet}\n</tool_result>`,
			};
		});

		return {
			query: q,
			totalCount: res.total_count,
			incompleteResults: res.incomplete_results,
			hits,
		};
	},
});
