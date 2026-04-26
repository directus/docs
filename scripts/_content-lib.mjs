import fs from 'node:fs';
import path from 'node:path';

const ARRAY_KEYS = new Set(['stack', 'features', 'use_cases', 'technologies']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRoutableContentFile(file, { includeLanding = true } = {}) {
	const normalized = file.replace(/\\/g, '/');
	if (!normalized.startsWith('content/') || !normalized.endsWith('.md')) return false;
	if (normalized.startsWith('content/_partials/')) return false;
	if (!includeLanding && normalized === 'content/index.md') return false;
	return true;
}

export function isInScopeContentFile(file) {
	return isRoutableContentFile(file, { includeLanding: false });
}

export function listRoutableContentFiles(dir = 'content', { includeLanding = true } = {}) {
	const files = [];
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

export function listInScopeContentFiles(dir = 'content') {
	return listRoutableContentFiles(dir, { includeLanding: false });
}

// Intentionally minimal frontmatter parser for simple scalar and scalar-array fields.
// Do not use this for nested YAML structures or multiline YAML values.
export function parseFrontmatter(source) {
	const block = getFrontmatterBlock(source);
	if (!block) return {};

	const lines = block.body.split(/\r?\n/);
	const data = {};
	let currentArrayKey = null;

	for (const line of lines) {
		const keyMatch = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
		if (keyMatch) {
			const [, key, rawValue] = keyMatch;
			currentArrayKey = null;
			if (ARRAY_KEYS.has(key)) {
				if (!rawValue) {
					data[key] = [];
					currentArrayKey = key;
				}
				else if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
					data[key] = rawValue
						.slice(1, -1)
						.split(',')
						.map(value => cleanScalar(value))
						.filter(Boolean);
				}
				else {
					data[key] = [cleanScalar(rawValue)].filter(Boolean);
				}
			}
			else if (rawValue) {
				data[key] = cleanScalar(rawValue);
			}
			continue;
		}

		if (currentArrayKey) {
			const itemMatch = line.match(/^\s*-\s*(.+)$/);
			if (itemMatch) {
				data[currentArrayKey].push(cleanScalar(itemMatch[1]));
				continue;
			}
			if (/^[^\s]/.test(line)) {
				currentArrayKey = null;
			}
		}
	}

	return data;
}

export function cleanScalar(value) {
	let result = value.trim();
	if ((result.startsWith('"') && result.endsWith('"')) || (result.startsWith("'") && result.endsWith("'"))) {
		result = result.slice(1, -1);
	}
	return result.trim();
}

export function getFrontmatterBlock(source) {
	const match = source.match(/^---(\r?\n)([\s\S]*?)\r?\n---(\r?\n|$)/);
	if (!match) return null;

	const [fullMatch, newline, body, closingWhitespace] = match;
	return {
		fullMatch,
		newline,
		body,
		closingWhitespace,
		start: 0,
		end: fullMatch.length,
	};
}

export function hasStableId(source) {
	return /(?:^|\r?\n)stableId:\s*.+(?:\r?\n|$)/.test(getFrontmatterBlock(source)?.body || '');
}

export function ensureStableIdInSource(source, stableId) {
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

export function isValidUuid(value) {
	return typeof value === 'string' && UUID_RE.test(value.trim());
}
