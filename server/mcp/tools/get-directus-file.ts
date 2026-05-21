import { defineMcpTool } from '@nuxtjs/mcp-toolkit/server';
import { z } from 'zod';
import { DIRECTUS_REPOS, DIRECTUS_REPO_SLUGS } from '../../utils/directus-repos';

const REF_REGEX = /^[a-zA-Z0-9._/-]{1,100}$/;
const SENSITIVE_PATH_REGEX = /(^|\/)(\.env[^/]*|secrets?|\.git|node_modules)(\/|$)/i;
const DEFAULT_CHUNK_BYTES = 50 * 1024;
const MAX_CHUNK_BYTES = 100 * 1024;

function hasControlChars(value: string): boolean {
	return [...value].some((char) => {
		const code = char.charCodeAt(0);
		return code <= 31 || code === 127;
	});
}

function validatePath(path: string): boolean {
	return !path.includes('..')
		&& !path.startsWith('/')
		&& !SENSITIVE_PATH_REGEX.test(path)
		&& !hasControlChars(path);
}

function sliceUtf8(text: string, offset: number, bytes: number): { content: string; nextOffset: number | null; truncated: boolean } {
	const buffer = Buffer.from(text, 'utf8');
	const start = Math.min(offset, buffer.length);
	const end = Math.min(start + bytes, buffer.length);
	let content = buffer.subarray(start, end).toString('utf8');
	while (content.includes('\uFFFD') && end > start) {
		content = buffer.subarray(start, end - 1).toString('utf8');
		break;
	}
	const consumed = Buffer.byteLength(content, 'utf8');
	const nextOffset = start + consumed < buffer.length ? start + consumed : null;
	return { content, nextOffset, truncated: nextOffset !== null };
}

export default defineMcpTool({
	name: 'get-directus-file',
	title: 'Fetch a file from a Directus GitHub repo',
	description:
		'Fetch raw file contents from an allowlisted Directus public GitHub repo at a given ref. Large files are returned in chunks; use offset with nextOffset to continue.',
	inputSchema: {
		repo: z.enum(DIRECTUS_REPO_SLUGS).default('directus').describe('Allowlisted Directus repo slug.'),
		path: z
			.string()
			.min(1)
			.max(300)
			.refine(validatePath, 'path must be relative and must not target sensitive directories or files')
			.describe('Path to file within the repo, e.g. "api/src/services/items.ts".'),
		ref: z
			.string()
			.regex(REF_REGEX)
			.optional()
			.describe('Branch, tag, or commit SHA. Defaults to "main".'),
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
	handler: async ({ repo, path, ref, offset, bytes }) => {
		const resolvedRef = ref ?? 'main';
		const fullRepo = DIRECTUS_REPOS[repo];
		const url = `https://raw.githubusercontent.com/${fullRepo}/${resolvedRef}/${path}`;
		const headers: Record<string, string> = { 'User-Agent': 'directus-docs-mcp' };
		if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

		let text: string;
		try {
			const response = await fetch(url, { headers });
			if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
			text = await response.text();
		}
		catch {
			throw createError({ statusCode: 502, message: 'GitHub fetch failed' });
		}

		const start = offset ?? 0;
		const chunkSize = bytes ?? DEFAULT_CHUNK_BYTES;
		const chunk = sliceUtf8(text, start, chunkSize);
		const suffix = chunk.truncated
			? `\n\n[truncated: call get-directus-file again with offset=${chunk.nextOffset} to read the next chunk]`
			: '';

		return {
			repo,
			path,
			ref: resolvedRef,
			offset: start,
			nextOffset: chunk.nextOffset,
			truncated: chunk.truncated,
			url: `https://github.com/${fullRepo}/blob/${resolvedRef}/${path}`,
			content: `<tool_result repo="${repo}" path="${path}" ref="${resolvedRef}" offset="${start}">\n${chunk.content}${suffix}\n</tool_result>`,
		};
	},
});
