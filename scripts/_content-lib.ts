import fs from 'node:fs';
import path from 'node:path';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type Frontmatter = Record<string, string | undefined>;

export interface EnsureResult {
	changed: boolean;
	source: string;
	reason: 'inserted' | 'already-present' | 'missing-frontmatter';
}

interface FrontmatterBlock {
	newline: string;
	body: string;
	closingWhitespace: string;
	end: number;
}

export function isRoutableContentFile(file: string): boolean {
	const f = file.replace(/\\/g, '/');
	return f.startsWith('content/') && f.endsWith('.md') && !f.startsWith('content/_partials/');
}

// content/index.md is owned by the marketing site and skipped for stable-id backfill,
// but still counts as a routable page for redirect continuity.
export function isStableIdContentFile(file: string): boolean {
	return isRoutableContentFile(file) && file.replace(/\\/g, '/') !== 'content/index.md';
}

export function listRoutableContentFiles(dir = 'content'): string[] {
	return walkContent(dir, isRoutableContentFile);
}

export function listStableIdContentFiles(dir = 'content'): string[] {
	return walkContent(dir, isStableIdContentFile);
}

function walkContent(dir: string, predicate: (file: string) => boolean): string[] {
	const out: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name).replace(/\\/g, '/');
		if (entry.isDirectory()) {
			if (entry.name === '_partials') continue;
			out.push(...walkContent(full, predicate));
		}
		else if (entry.isFile() && predicate(full)) {
			out.push(full);
		}
	}
	return out;
}

// Minimal frontmatter parser: top-level scalar fields only. Used by hooks/scripts where
// fast startup matters more than full YAML support.
export function parseFrontmatter(source: string): Frontmatter {
	const block = getFrontmatterBlock(source);
	if (!block) return {};

	const data: Frontmatter = {};
	for (const line of block.body.split(/\r?\n/)) {
		const m = line.match(/^([A-Za-z_][\w-]*):\s*(.+)$/);
		if (m) data[m[1]] = unquote(m[2]);
	}
	return data;
}

function getFrontmatterBlock(source: string): FrontmatterBlock | null {
	const m = source.match(/^---(\r?\n)([\s\S]*?)\r?\n---(\r?\n|$)/);
	if (!m) return null;
	return { newline: m[1], body: m[2], closingWhitespace: m[3], end: m[0].length };
}

function unquote(value: string): string {
	const v = value.trim();
	if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
		return v.slice(1, -1).trim();
	}
	return v;
}

export function ensureStableIdInSource(source: string, stableId: string): EnsureResult {
	const block = getFrontmatterBlock(source);
	if (!block) return { changed: false, source, reason: 'missing-frontmatter' };
	if (/(?:^|\r?\n)stableId:\s*\S/.test(block.body)) {
		return { changed: false, source, reason: 'already-present' };
	}
	const head = `---${block.newline}stableId: ${stableId}${block.newline}${block.body}${block.newline}---${block.closingWhitespace}`;
	return { changed: true, source: head + source.slice(block.end), reason: 'inserted' };
}

export function isValidUuid(value: unknown): value is string {
	return typeof value === 'string' && UUID_RE.test(value.trim());
}
