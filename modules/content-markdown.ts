/* Emit a cleaned `.md` sibling for every content page into .output/public/. */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { defineNuxtModule, useLogger } from '@nuxt/kit';
import { contentToMarkdown } from '../server/utils/contentToMarkdown';

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
				partials.set(name, stripFrontmatter(await readFile(file, 'utf8')));
			}

			let written = 0;
			for (const file of markdownFiles) {
				const rel = relative(contentDir, file);
				const segments = rel.split(sep);
				if (segments.includes('_partials')) continue;

				const route = toRoute(segments);
				const raw = await readFile(file, 'utf8');
				const md = contentToMarkdown(raw, partials);

				const outPath = join(outDir, route + '.md');
				await mkdir(dirname(outPath), { recursive: true });
				await writeFile(outPath, md, 'utf8');
				written++;
			}

			logger.info(`Wrote ${written} content markdown files`);
		});
	},
});

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
	const last = cleaned[cleaned.length - 1].replace(/\.md$/, '');
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
