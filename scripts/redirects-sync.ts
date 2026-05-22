#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { ExecFileSyncOptionsWithStringEncoding } from 'node:child_process';

import { isRoutableContentFile, listRoutableContentFiles, parseFrontmatter } from './_content-lib.ts';
import { loadRedirects, writeRedirects } from './_redirects-lib.ts';

interface Options {
	base: string;
	manifest: string;
	dryRun: boolean;
	failOnUnresolved: boolean;
}

interface Page {
	path: string;
	sourceFile: string;
	stableId?: string;
}

interface Unresolved {
	page: Page;
	reason: string;
	matches: Page[];
}

function parseArgs(argv: string[]): Options {
	const opts: Options = {
		base: 'origin/main',
		manifest: 'redirects.json',
		dryRun: false,
		failOnUnresolved: false,
	};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--') continue;
		else if (arg === '--base') opts.base = required(argv, ++i, arg);
		else if (arg === '--manifest') opts.manifest = required(argv, ++i, arg);
		else if (arg === '--dry-run') opts.dryRun = true;
		else if (arg === '--fail-on-unresolved') opts.failOnUnresolved = true;
		else if (arg === '--help' || arg === '-h') {
			help();
			process.exit(0);
		}
		else {
			console.error(`Unknown argument: ${arg}`);
			help();
			process.exit(1);
		}
	}
	return opts;
}

function required(argv: string[], i: number, name: string): string {
	const v = argv[i];
	if (!v || v.startsWith('--')) {
		console.error(`Missing value for ${name}`);
		process.exit(1);
	}
	return v;
}

function help(): void {
	console.log(`Usage: node scripts/redirects-sync.ts [options]

  --base <ref>            Base git ref to diff against (default: origin/main)
  --manifest <file>       Redirect manifest (default: redirects.json)
  --dry-run               Do not write the manifest
  --fail-on-unresolved    Exit non-zero if unresolved removed routes remain`);
}

function git(args: string[], options: Partial<ExecFileSyncOptionsWithStringEncoding> = {}): string {
	return execFileSync('git', args, { encoding: 'utf8', ...options });
}

// Numeric ordering prefixes (e.g. `01.intro.md`) affect nav order but not URL shape.
function stripPrefix(s: string): string {
	return s.replace(/^\d+\./, '');
}

function buildPublicPath(file: string): string {
	const rel = file.replace(/^content\//, '');
	const parts = rel.split('/');
	const fileName = parts.pop()!;
	const stem = stripPrefix(fileName.replace(/\.md$/, ''));
	const dirs = parts.map(stripPrefix).filter(Boolean);
	if (stem !== 'index') dirs.push(stem);
	return dirs.length ? `/${dirs.join('/')}` : '/';
}

function toPage(file: string, source: string): Page {
	const fm = parseFrontmatter(source);
	return { path: buildPublicPath(file), sourceFile: file, stableId: fm.stableId };
}

function loadBasePages(baseRef: string): Page[] {
	try {
		git(['rev-parse', '--verify', baseRef], { stdio: 'ignore' });
	}
	catch {
		throw new Error(`Base ref ${baseRef} not found. Run \`git fetch origin main\` or pass --base.`);
	}
	return git(['ls-tree', '-r', '--name-only', baseRef, '--', 'content'])
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.filter(isRoutableContentFile)
		.map(file => toPage(file, git(['show', `${baseRef}:${file}`])));
}

function loadCurrentPages(): Page[] {
	return listRoutableContentFiles().map(file => toPage(file, fs.readFileSync(file, 'utf8')));
}

function main(): void {
	const opts = parseArgs(process.argv.slice(2));
	const basePages = loadBasePages(opts.base);
	const currentPages = loadCurrentPages();
	const manifest = loadRedirects(opts.manifest);

	const currentPaths = new Set(currentPages.map(p => p.path));
	const currentByStableId = new Map<string, Page[]>();
	for (const page of currentPages) {
		if (!page.stableId) continue;
		const list = currentByStableId.get(page.stableId) ?? [];
		list.push(page);
		currentByStableId.set(page.stableId, list);
	}

	const resolved: Array<{ from: string; to: string }> = [];
	const unresolved: Unresolved[] = [];

	for (const old of basePages) {
		if (currentPaths.has(old.path) || manifest[old.path]) continue;

		if (!old.stableId) {
			unresolved.push({ page: old, reason: 'no stableId in base ref', matches: [] });
			continue;
		}

		const matches = (currentByStableId.get(old.stableId) ?? []).filter(p => p.path !== old.path);
		if (matches.length === 1) {
			resolved.push({ from: old.path, to: matches[0].path });
		}
		else if (matches.length > 1) {
			unresolved.push({ page: old, reason: 'multiple current routes share stableId', matches });
		}
		else {
			unresolved.push({ page: old, reason: 'no current route with same stableId', matches: [] });
		}
	}

	if (resolved.length && !opts.dryRun) {
		const merged = { ...manifest };
		for (const { from, to } of resolved) merged[from] = { to, statusCode: 301 };
		writeRedirects(opts.manifest, merged);
	}

	console.log(`Base ref: ${opts.base}`);
	console.log(`Base pages: ${basePages.length}`);
	console.log(`Current pages: ${currentPages.length}`);
	console.log(`Deterministic redirects: ${resolved.length}${opts.dryRun ? ' (dry run, not written)' : ''}`);
	console.log(`Unresolved: ${unresolved.length}`);

	if (unresolved.length) {
		console.error(`\nUnresolved removed routes (add to ${opts.manifest} manually):`);
		for (const { page, reason, matches } of unresolved) {
			console.error(`- ${page.path}  [${reason}]`);
			for (const match of matches) console.error(`    candidate: ${match.path}`);
		}
	}

	// In dry-run mode, pending deterministic redirects also mean redirects.json is stale.
	const pendingDeterministic = opts.dryRun && resolved.length > 0;
	if (opts.failOnUnresolved && (unresolved.length || pendingDeterministic)) {
		if (pendingDeterministic) {
			console.error(`\n${resolved.length} deterministic redirect(s) pending; run \`pnpm redirects:sync\` to write them.`);
		}
		process.exit(1);
	}
}

main();
