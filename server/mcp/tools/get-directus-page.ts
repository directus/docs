import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { z } from 'zod';
import { sliceUtf8 } from '../../utils/sliceUtf8';

const DEFAULT_CHUNK_BYTES = 50 * 1024;
const MAX_CHUNK_BYTES = 100 * 1024;

// Marketing/website pages serve clean Markdown via the `?md` query param (and
// `Accept: text/markdown` content negotiation). Restrict fetches to this host
// so the tool can't be used as a general web fetcher.
const ALLOWED_HOSTS = new Set(['directus.com']);

function resolveUrl(input: string): URL | null {
	let url: URL;
	try {
		// Accept bare paths ("/pricing") and full URLs alike.
		url = input.startsWith('http') ? new URL(input) : new URL(input, 'https://directus.com');
	}
	catch {
		return null;
	}

	if (url.protocol !== 'https:') return null;
	if (!ALLOWED_HOSTS.has(url.hostname)) return null;

	url.searchParams.set('md', '');
	return url;
}

export default defineMcpTool({
	name: 'get-directus-page',
	title: 'Fetch a page from the Directus website',
	description:
		'Fetch a page from the Directus marketing website (directus.com) as Markdown. Use for current pricing, plans, the Open Innovation Grant, partner programs, comparisons, and other non-docs pages. Pass a path like "/pricing" or "/oig". Large pages are returned in chunks; use offset with nextOffset to continue.',
	inputSchema: {
		path: z
			.string()
			.min(1)
			.max(300)
			.describe('Page path or full URL on directus.com, e.g. "/pricing" or "/oig".'),
		offset: z
			.number()
			.int()
			.min(0)
			.optional()
			.describe('Byte offset to start reading from. Use nextOffset from a truncated result to continue.'),
		bytes: z
			.number()
			.int()
			.min(1024)
			.max(MAX_CHUNK_BYTES)
			.optional()
			.describe('Max bytes to return. Default 50KB, max 100KB.'),
	},
	cache: '1h',
	handler: async ({ path, offset, bytes }) => {
		const url = resolveUrl(path);
		if (!url) {
			throw createError({ statusCode: 400, message: 'path must be an https page on directus.com' });
		}

		let text: string;
		try {
			const response = await fetch(url, {
				headers: { 'User-Agent': 'directus-docs-mcp', 'Accept': 'text/markdown' },
			});
			if (!response.ok) throw new Error(`Website returned ${response.status}`);
			text = await response.text();
		}
		catch {
			throw createError({ statusCode: 502, message: 'Website fetch failed' });
		}

		const start = offset ?? 0;
		const chunkSize = bytes ?? DEFAULT_CHUNK_BYTES;
		const chunk = sliceUtf8(text, start, chunkSize);
		const suffix = chunk.truncated
			? `\n\n[truncated: call get-directus-page again with offset=${chunk.nextOffset} to read the next chunk]`
			: '';

		return {
			path,
			url: url.href,
			offset: start,
			nextOffset: chunk.nextOffset,
			truncated: chunk.truncated,
			content: `<tool_result url="${url.href}" offset="${start}">\n${chunk.content}${suffix}\n</tool_result>`,
		};
	},
});
