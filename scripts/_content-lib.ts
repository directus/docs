import fs from 'node:fs';
import path from 'node:path';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ScopeOptions {
	includeLanding?: boolean;
}

export interface Frontmatter {
	[key: string]: string | undefined;
}

export interface FrontmatterBlock {
	newline: string;
	body: string;
	closingWhitespace: string;
	end: number;
}

export type EnsureReason = 'inserted' | 'already-present' | 'missing-frontmatter';

export interface EnsureResult {
	changed: boolean;
	source: string;
	reason: EnsureReason;
}

/**
 * Stable IDs only matter for public, relocatable docs pages.
 * Partials are excluded because they do not own routes, and the landing page is
 * excluded because it is intentionally fixed at / and is not part of redirect continuity.
 */

export function isRoutableContentFile(file: string, { includeLanding = true }: ScopeOptions = {}): boolean {
	const normalized = file.replace(/\\/g, '/');
	if (!normalized.startsWith('content/') || !normalized.endsWith('.md')) return false;
	if (normalized.startsWith('content/_partials/')) return false;
	if (!includeLanding && normalized === 'content/index.md') return false;
	return true;
}

export function isInScopeContentFile(file: string): boolean {
	return isRoutableContentFile(file, { includeLanding: false });
}

export function listRoutableContentFiles(dir = 'content', { includeLanding = true }: ScopeOptions = {}): string[] {
	const files: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		const normalized = fullPath.replace(/\\/g, '/');
		if (entry.isDirectory()) {
			if (entry.name === '_partials') continue;
			files.push(...listRoutableContentFiles(fullPath, { includeLanding }));
			continue;
		}
		if (entry.isFile() && isRoutableContentFile(normalized, { includeLanding })) {
			files.push(normalized);
		}
	}
	return files;
}

export function listInScopeContentFiles(dir = 'content'): string[] {
	return listRoutableContentFiles(dir, { includeLanding: false });
}

/**
 * Intentionally minimal frontmatter parser for top-level scalar fields only.
 * We keep this dependency-free because the stable ID and redirect workflows only need
 * a few top-level fields and run inside hooks/scripts where fast startup matters.
 * Do not use this for arrays, nested YAML structures, or multiline YAML values.
 */
export function parseFrontmatter(source: string): Frontmatter {
	const block = getFrontmatterBlock(source);
	if (!block) return {};

	const data: Frontmatter = {};
	for (const line of block.body.split(/\r?\n/)) {
		const keyMatch = line.match(/^([A-Za-z_][\w-]*):\s*(.+)$/);
		if (keyMatch) {
			const [, key, rawValue] = keyMatch;
			data[key] = cleanScalar(rawValue);
		}
	}

	return data;
}

export function cleanScalar(value: string): string {
	let result = value.trim();
	if ((result.startsWith('"') && result.endsWith('"')) || (result.startsWith("'") && result.endsWith("'"))) {
		result = result.slice(1, -1);
	}
	return result.trim();
}

/**
 * Preserve the file's existing newline style so hook-driven edits stay mechanical and
 * do not create noisy cross-platform diffs.
 */
export function getFrontmatterBlock(source: string): FrontmatterBlock | null {
	const match = source.match(/^---(\r?\n)([\s\S]*?)\r?\n---(\r?\n|$)/);
	if (!match) return null;

	const [fullMatch, newline, body, closingWhitespace] = match;
	return {
		newline,
		body,
		closingWhitespace,
		end: fullMatch.length,
	};
}

export function hasStableId(source: string): boolean {
	return /(?:^|\r?\n)stableId:\s*.+(?:\r?\n|$)/.test(getFrontmatterBlock(source)?.body || '');
}

/**
 * Insert stableId as the first frontmatter field so the backfill stays easy to scan
 * and future merges are less likely to bury identity changes inside unrelated metadata.
 */
export function ensureStableIdInSource(source: string, stableId: string): EnsureResult {
	const block = getFrontmatterBlock(source);
	if (!block) {
		return { changed: false, source, reason: 'missing-frontmatter' };
	}

	if (hasStableId(source)) {
		return { changed: false, source, reason: 'already-present' };
	}

	const inserted = `---${block.newline}stableId: ${stableId}${block.newline}${block.body}${block.newline}---${block.closingWhitespace}`;
	const updated = inserted + source.slice(block.end);
	return { changed: true, source: updated, reason: 'inserted' };
}

export function isValidUuid(value: unknown): value is string {
	return typeof value === 'string' && UUID_RE.test(value.trim());
}
