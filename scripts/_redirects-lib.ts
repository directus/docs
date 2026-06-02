import fs from 'node:fs';

export type RedirectStatusCode = 301 | 302 | 307 | 308;

const VALID_STATUS_CODES: ReadonlySet<RedirectStatusCode> = new Set([301, 302, 307, 308]);

export interface RedirectEntry {
	to: string;
	statusCode: RedirectStatusCode;
}

export type RedirectRouteRules = Record<string, { redirect: { to: string; statusCode: RedirectStatusCode } }>;

export function loadRedirects(file: string): Record<string, RedirectEntry> {
	if (!fs.existsSync(file)) return {};

	const raw = fs.readFileSync(file, 'utf8').trim();
	if (!raw) return {};

	const parsed = JSON.parse(raw) as unknown;
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error(`${file}: must be a JSON object keyed by source path`);
	}

	const entries: Record<string, RedirectEntry> = {};
	for (const [from, value] of Object.entries(parsed as Record<string, unknown>)) {
		entries[from] = parseEntry(file, from, value);
	}
	return entries;
}

function parseEntry(file: string, from: string, value: unknown): RedirectEntry {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`${file}: entry for ${from} must be { to: string, statusCode: 301|302|307|308 }`);
	}
	const { to, statusCode } = value as { to?: unknown; statusCode?: unknown };
	if (typeof to !== 'string' || typeof statusCode !== 'number' || !VALID_STATUS_CODES.has(statusCode as RedirectStatusCode)) {
		throw new Error(`${file}: entry for ${from} must be { to: string, statusCode: 301|302|307|308 }`);
	}
	return { to, statusCode: statusCode as RedirectStatusCode };
}

export function writeRedirects(file: string, entries: Record<string, RedirectEntry>): void {
	const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
	fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + '\n');
}

export function toRouteRules(entries: Record<string, RedirectEntry>, baseURL: string): RedirectRouteRules {
	const rules: RedirectRouteRules = {};
	for (const [from, { to, statusCode }] of Object.entries(entries)) {
		rules[`${baseURL}${from}`] = { redirect: { to: `${baseURL}${to}`, statusCode } };
	}
	return rules;
}
