#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { ExecFileSyncOptionsWithStringEncoding } from 'node:child_process';

import { isRoutableContentFile, listRoutableContentFiles, parseFrontmatter } from './_content-lib.ts';

interface CliOptions {
	base: string;
	manifest: string;
	hints: string;
	report: string;
	writeDeterministic: boolean;
	failOnUnresolved: boolean;
	noWrite: boolean;
}

interface SnapshotItem {
	path: string;
	sourceFile: string;
	title?: string;
	stableId?: string;
}

type RedirectStatusCode = 301 | 302 | 307 | 308;

const VALID_STATUS_CODES: ReadonlySet<RedirectStatusCode> = new Set([301, 302, 307, 308]);

interface RedirectEntry {
	to: string;
	statusCode: RedirectStatusCode;
}

interface ManifestData {
	entries: Record<string, RedirectEntry>;
	fromSet: Set<string>;
}

interface Hints {
	manualRedirects: Record<string, string>;
}

interface AcceptedResolution {
	status: 'accepted';
	from: string;
	to: string;
}

interface UnresolvedResolution {
	status: 'unresolved';
	reason: string;
	old: SnapshotItem;
	matches: SnapshotItem[];
}

type Resolution = AcceptedResolution | UnresolvedResolution;

interface Summary {
	baseRef: string;
	basePages: number;
	currentPages: number;
	removedRoutes: number;
	uncoveredRemovedRoutes: number;
	deterministicRedirects: number;
	redirectDecisionsNeeded: number;
}

const DEFAULTS: CliOptions = {
	base: 'origin/main',
	manifest: 'redirects.json',
	hints: '.docs/redirect-hints.json',
	report: '.docs/redirect-decisions-needed.json',
	writeDeterministic: false,
	failOnUnresolved: false,
	noWrite: false,
};

function parseArgs(argv: string[]): CliOptions {
	const options: CliOptions = { ...DEFAULTS };

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--base') options.base = argv[++i];
		else if (arg === '--manifest') options.manifest = argv[++i];
		else if (arg === '--hints') options.hints = argv[++i];
		else if (arg === '--report' || arg === '--suggest') options.report = argv[++i];
		else if (arg === '--write-deterministic' || arg === '--accept-high-confidence') options.writeDeterministic = true;
		else if (arg === '--fail-on-unresolved') options.failOnUnresolved = true;
		else if (arg === '--no-write') options.noWrite = true;
		else if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
		else {
			console.error(`Unknown argument: ${arg}`);
			printHelp();
			process.exit(1);
		}
	}

	return options;
}

function printHelp(): void {
	console.log(`redirects-sync

Usage:
  node scripts/redirects-sync.ts [options]

Options:
  --base <git-ref>          Base git ref to diff against (default: origin/main)
  --manifest <file>         Redirect manifest JSON (default: redirects.json)
  --hints <file>            Manual redirect hints JSON (default: .docs/redirect-hints.json)
  --report <file>           Redirect decisions report (default: .docs/redirect-decisions-needed.json)
  --write-deterministic     Auto-write deterministic redirects to the manifest
  --fail-on-unresolved      Exit non-zero if redirect decisions remain
  --no-write                Do not write manifest or report files
`);
}

function runGit(args: string[], options: Partial<ExecFileSyncOptionsWithStringEncoding> = {}): string {
	try {
		return execFileSync('git', args, { encoding: 'utf8', ...options });
	}
	catch (error) {
		const err = error as { stderr?: { toString?: () => string }; message?: string };
		const details = err.stderr?.toString?.() || err.message || String(error);
		throw new Error(`git ${args.join(' ')} failed:\n${details}`);
	}
}

function assertBaseRefExists(baseRef: string): void {
	try {
		runGit(['rev-parse', '--verify', baseRef], { stdio: 'ignore' });
	}
	catch {
		throw new Error(`Base ref ${baseRef} does not exist locally. Run \`git fetch origin main\` or pass a different --base ref.`);
	}
}

function listBaseContentFiles(baseRef: string): string[] {
	const output = runGit(['ls-tree', '-r', '--name-only', baseRef, '--', 'content']);
	return output
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.filter(file => isRoutableContentFile(file));
}

function readBaseFile(baseRef: string, file: string): string {
	return runGit(['show', `${baseRef}:${file}`]);
}

function readCurrentFile(file: string): string {
	return fs.readFileSync(file, 'utf8');
}

function stripNumericPrefix(segment: string): string {
	return segment.replace(/^\d+\./, '');
}

/**
 * Redirect continuity must follow Nuxt's public route semantics, not raw filesystem
 * paths. In particular, numeric ordering prefixes affect nav order but not URL shape.
 */
function buildPublicPath(file: string): string {
	const relative = file.replace(/^content\//, '');
	const parts = relative.split('/');
	const fileName = parts.pop()!;
	const fileStem = stripNumericPrefix(fileName.replace(/\.[^.]+$/, ''));
	const pathParts = parts.map(stripNumericPrefix).filter(Boolean);

	if (fileStem !== 'index') {
		pathParts.push(fileStem);
	}

	return normalizePublicPath(`/${pathParts.join('/')}`);
}

function normalizePublicPath(routePath: string): string {
	if (!routePath || routePath === '/') return '/';
	const normalized = `/${routePath.replace(/^\/+/, '').replace(/\/+$/, '')}`;
	return normalized === '/index' ? '/' : normalized;
}

function toSnapshotItem(file: string, source: string): SnapshotItem {
	const frontmatter = parseFrontmatter(source);
	return {
		path: buildPublicPath(file),
		sourceFile: file,
		title: typeof frontmatter.title === 'string' ? frontmatter.title : undefined,
		stableId: typeof frontmatter.stableId === 'string' ? frontmatter.stableId : undefined,
	};
}

function loadSnapshot(files: string[], readFile: (file: string) => string): SnapshotItem[] {
	return files.map(file => toSnapshotItem(file, readFile(file)));
}

function indexByPath(items: SnapshotItem[]): Map<string, SnapshotItem> {
	return new Map(items.map(item => [item.path, item]));
}

function indexByStableId(items: SnapshotItem[]): Map<string, SnapshotItem[]> {
	const byStableId = new Map<string, SnapshotItem[]>();
	for (const item of items) {
		if (!item.stableId) continue;
		const matches = byStableId.get(item.stableId) || [];
		matches.push(item);
		byStableId.set(item.stableId, matches);
	}
	return byStableId;
}

function loadRedirectManifest(file: string): ManifestData {
	if (!fs.existsSync(file)) {
		return { entries: {}, fromSet: new Set() };
	}

	const text = fs.readFileSync(file, 'utf8').trim();
	if (!text) return { entries: {}, fromSet: new Set() };

	const parsed = JSON.parse(text) as unknown;
	if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error(`Redirect manifest ${file} must be a JSON object keyed by source path`);
	}

	const entries: Record<string, RedirectEntry> = {};
	for (const [from, value] of Object.entries(parsed as Record<string, unknown>)) {
		if (!value || typeof value !== 'object') {
			throw new Error(`Invalid redirect entry for ${from} in ${file}: expected { to: string, statusCode: number }`);
		}
		const candidate = value as { to?: unknown; statusCode?: unknown };
		if (typeof candidate.to !== 'string' || typeof candidate.statusCode !== 'number') {
			throw new Error(`Invalid redirect entry for ${from} in ${file}: expected { to: string, statusCode: number }`);
		}
		if (!VALID_STATUS_CODES.has(candidate.statusCode as RedirectStatusCode)) {
			throw new Error(`Invalid redirect entry for ${from} in ${file}: statusCode ${candidate.statusCode} must be one of 301, 302, 307, 308`);
		}
		entries[from] = { to: candidate.to, statusCode: candidate.statusCode as RedirectStatusCode };
	}

	return { entries, fromSet: new Set(Object.keys(entries)) };
}

function loadHints(file: string): Hints {
	if (!fs.existsSync(file)) {
		return { manualRedirects: {} };
	}

	const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as { manualRedirects?: Record<string, string> };
	return {
		manualRedirects: parsed.manualRedirects || {},
	};
}

function writeRedirectManifest(file: string, entries: Record<string, RedirectEntry>): void {
	const sorted = Object.fromEntries(
		Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)),
	);
	fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + '\n');
}

/**
 * Redirect generation is intentionally strict: deterministic same-stableId matches can
 * be auto-written, while splits, merges, and deletions stay manual decisions.
 */
function resolveRemovedRoute(
	oldPage: SnapshotItem,
	currentByStableId: Map<string, SnapshotItem[]>,
	manualRedirects: Record<string, string>,
): Resolution {
	const manualTarget = manualRedirects[oldPage.path];
	if (manualTarget) {
		return {
			status: 'accepted',
			from: oldPage.path,
			to: manualTarget,
		};
	}

	if (!oldPage.stableId) {
		// During the rollout, old routes from a base ref without stable IDs must stay manual.
		return {
			status: 'unresolved',
			reason: 'old route has no stableId in base ref',
			old: oldPage,
			matches: [],
		};
	}

	const matches = (currentByStableId.get(oldPage.stableId) || [])
		.filter(candidate => candidate.path !== oldPage.path);

	if (matches.length === 1) {
		return {
			status: 'accepted',
			from: oldPage.path,
			to: matches[0].path,
		};
	}

	if (matches.length > 1) {
		return {
			status: 'unresolved',
			reason: 'multiple current routes share the same stableId',
			old: oldPage,
			matches,
		};
	}

	return {
		status: 'unresolved',
		reason: 'no current route found with the same stableId',
		old: oldPage,
		matches: [],
	};
}

/**
 * The report is optimized for human review, not programmatic scoring. Once stable IDs
 * exist everywhere, the remaining cases are true editorial decisions.
 */
interface DecisionPayload {
	generatedAt: string;
	summary: Summary;
	unresolved: Array<{
		reason: string;
		old: { path: string; title: string; sourceFile: string; stableId: string };
		matches: Array<{ path: string; title: string; sourceFile: string; stableId: string }>;
	}>;
}

function writeDecisionArtifacts(file: string, unresolved: UnresolvedResolution[], summary: Summary): void {
	const payload = {
		generatedAt: new Date().toISOString(),
		summary,
		unresolved: unresolved.map(item => ({
			reason: item.reason,
			old: {
				path: item.old.path,
				title: item.old.title || '',
				sourceFile: item.old.sourceFile || '',
				stableId: item.old.stableId || '',
			},
			matches: item.matches.map(match => ({
				path: match.path,
				title: match.title || '',
				sourceFile: match.sourceFile || '',
				stableId: match.stableId || '',
			})),
		})),
	};

	const markdownFile = file.endsWith('.json')
		? file.replace(/\.json$/i, '.md')
		: `${file}.md`;

	if (unresolved.length) {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');
		fs.writeFileSync(markdownFile, buildDecisionMarkdown(payload));
	}
	else {
		if (fs.existsSync(file)) fs.rmSync(file);
		if (fs.existsSync(markdownFile)) fs.rmSync(markdownFile);
	}
}

function buildDecisionMarkdown(payload: DecisionPayload): string {
	const lines = [
		'# Redirect Decisions Needed',
		'',
		`Generated: ${payload.generatedAt}`,
		'',
		`- Redirect decisions needed: ${payload.summary.redirectDecisionsNeeded}`,
		'',
	];

	for (const item of payload.unresolved) {
		lines.push(`## ${item.old.path}`);
		if (item.old.title) lines.push(`- Old title: ${item.old.title}`);
		if (item.old.sourceFile) lines.push(`- Old file: \`${item.old.sourceFile}\``);
		if (item.old.stableId) lines.push(`- stableId: \`${item.old.stableId}\``);
		lines.push(`- Reason: ${item.reason}`);
		lines.push('');

		if (item.matches.length) {
			lines.push('| Matching route | Title | File |');
			lines.push('|---|---|---|');
			for (const match of item.matches) {
				lines.push(`| \`${match.path}\` | ${match.title || ''} | \`${match.sourceFile || ''}\` |`);
			}
			lines.push('');
		}
	}

	return lines.join('\n') + '\n';
}

function main(): void {
	const options = parseArgs(process.argv.slice(2));
	assertBaseRefExists(options.base);
	const hints = loadHints(options.hints);
	const manifest = loadRedirectManifest(options.manifest);
	const basePages = loadSnapshot(listBaseContentFiles(options.base), file => readBaseFile(options.base, file));
	const currentPages = loadSnapshot(listRoutableContentFiles(), readCurrentFile);

	const baseByPath = indexByPath(basePages);
	const currentByPath = indexByPath(currentPages);
	const currentByStableId = indexByStableId(currentPages);

	const removed = [...baseByPath.values()].filter(page => !currentByPath.has(page.path));
	const uncoveredRemoved = removed.filter(page => !manifest.fromSet.has(page.path));

	const accepted: AcceptedResolution[] = [];
	const unresolved: UnresolvedResolution[] = [];

	for (const oldPage of uncoveredRemoved) {
		const resolution = resolveRemovedRoute(oldPage, currentByStableId, hints.manualRedirects);
		if (resolution.status === 'accepted') accepted.push(resolution);
		else unresolved.push(resolution);
	}

	const newEntries = options.writeDeterministic
		? accepted.filter(row => !manifest.fromSet.has(row.from))
		: [];

	const summary: Summary = {
		baseRef: options.base,
		basePages: basePages.length,
		currentPages: currentPages.length,
		removedRoutes: removed.length,
		uncoveredRemovedRoutes: uncoveredRemoved.length,
		deterministicRedirects: accepted.length,
		redirectDecisionsNeeded: unresolved.length,
	};

	if (!options.noWrite) {
		if (newEntries.length) {
			const merged = { ...manifest.entries };
			for (const entry of newEntries) {
				merged[entry.from] = { to: entry.to, statusCode: 301 };
			}
			writeRedirectManifest(options.manifest, merged);
		}
		writeDecisionArtifacts(options.report, unresolved, summary);
	}

	console.log(`Base ref: ${summary.baseRef}`);
	console.log(`Base pages: ${summary.basePages}`);
	console.log(`Current pages: ${summary.currentPages}`);
	console.log(`Removed routes: ${summary.removedRoutes}`);
	console.log(`Uncovered removed routes: ${summary.uncoveredRemovedRoutes}`);
	console.log(`Deterministic redirects: ${summary.deterministicRedirects}`);
	console.log(`Redirect decisions needed: ${summary.redirectDecisionsNeeded}`);

	if (newEntries.length) {
		console.log(`Wrote ${newEntries.length} redirect(s) to ${options.manifest}`);
	}
	if (unresolved.length && !options.noWrite) {
		console.log(`Review redirect decisions in ${options.report.replace(/\.json$/i, '.md')}`);
	}

	if (unresolved.length) {
		console.error('\nRedirect decisions needed:');
		for (const item of unresolved.slice(0, 20)) {
			console.error(`- ${item.old.path}: ${item.reason}`);
		}
	}

	if (options.failOnUnresolved && unresolved.length > 0) {
		process.exit(1);
	}
}

main();
