/* Emit a cleaned `.md` sibling for every content page into .output/public/. */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { defineNuxtModule, useLogger } from '@nuxt/kit';
import type { NitroOptions } from 'nitropack';
import { contentToMarkdown } from '../server/utils/contentToMarkdown';
import { parseMcpMarkdown } from '../server/utils/mcpMarkdown';

interface McpDocIndexEntry {
	title: string;
	path: string;
	description: string;
}

export default defineNuxtModule({
	meta: { name: 'content-markdown' },

	setup(_options, nuxt) {
		const logger = useLogger('content-markdown');
		const contentDir = join(nuxt.options.rootDir, 'content');

		nuxt.hook('nitro:build:public-assets', async (nitro) => {
			const outDir = nitro.options.output.publicDir;

			const allFiles = await walk(contentDir);
			const markdownFiles = allFiles.filter(f => f.endsWith('.md'));

			const partials = new Map<string, string>();
			for (const file of markdownFiles) {
				const rel = relative(contentDir, file);
				if (!rel.split(sep).includes('_partials')) continue;
				const name = stripStemPrefix(rel.split(sep).pop()!.replace(/\.md$/, ''));
				if (partials.has(name)) logger.warn(`Duplicate partial name "${name}" in ${rel}`);
				partials.set(name, stripFrontmatter(await readFile(file, 'utf8')));
			}

			let written = 0;
			const index: McpDocIndexEntry[] = [];
			for (const file of markdownFiles) {
				const rel = relative(contentDir, file);
				const segments = rel.split(sep);
				if (segments.includes('_partials')) continue;

				const route = toRoute(segments);
				const raw = await readFile(file, 'utf8');
				const md = contentToMarkdown(raw, partials);
				const path = route === '/index' ? '/' : route;
				const page = parseMcpMarkdown(md, path);

				const outPath = join(outDir, route + '.md');
				await mkdir(dirname(outPath), { recursive: true });
				await writeFile(outPath, md, 'utf8');
				index.push({
					title: page.title,
					path,
					description: page.description,
				});
				written++;
			}

			index.sort((a, b) => a.path.localeCompare(b.path));
			await writeFile(join(outDir, 'mcp-docs-index.json'), JSON.stringify(index, null, 2), 'utf8');

			logger.info(`Wrote ${written} content markdown files and ${index.length} MCP index entries`);

			if (nitro.options.preset.includes('vercel')) {
				addVercelAgentRoutes(nitro.options, index.map(entry => entry.path));
			}
		});
	},
});

/*
 * On Vercel, prerendered pages are served from the CDN before server middleware runs,
 * so server/middleware/markdown-negotiation.ts never sees them. Mirror it in Vercel's
 * routing layer with an exact rewrite per page to its `.md` sibling (a page without
 * one keeps serving HTML), and point agents at llms.txt via a Link header (RFC 8288).
 * Pushed onto `vercel.config.routes`, which Nitro places ahead of its own routes.
 */
function addVercelAgentRoutes(options: NitroOptions, paths: string[]) {
	const base = options.baseURL.replace(/\/$/, '');
	const routes: Record<string, unknown>[] = [{
		src: `^${base}(?:/.*)?$`,
		headers: { Link: `<${base}/llms.txt>; rel="describedby"; type="text/plain"` },
		continue: true,
	}];
	for (const path of paths) {
		routes.push({
			src: `^${escapeRegExp(base + path.replace(/\/$/, ''))}/?$`,
			has: [{ type: 'header', key: 'accept', value: '(.*)text/markdown(.*)' }],
			dest: `${base}${path === '/' ? '/index' : path}.md`,
		});
	}
	const vercel = options.vercel ||= { config: { version: 3 } };
	vercel.config ||= { version: 3 };
	(vercel.config.routes ||= []).push(...routes as never[]);
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function walk(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...await walk(full));
		else if (entry.isFile()) files.push(full);
	}
	return files;
}

function toRoute(segments: string[]): string {
	const cleaned = segments.map(stripStemPrefix);
	const lastSegment = cleaned[cleaned.length - 1];
	if (!lastSegment) return '/index';
	const last = lastSegment.replace(/\.md$/, '');
	const prefix = cleaned.slice(0, -1);
	if (last === 'index') return prefix.length ? '/' + prefix.join('/') : '/index';
	return '/' + [...prefix, last].join('/');
}

function stripStemPrefix(name: string): string {
	return name.replace(/^\d+\./, '');
}

function stripFrontmatter(body: string): string {
	if (!body.startsWith('---\n')) return body;
	const end = body.indexOf('\n---', 4);
	if (end === -1) return body;
	return body.slice(end + 4).replace(/^\n/, '');
}
