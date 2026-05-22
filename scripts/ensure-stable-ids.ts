#!/usr/bin/env node

import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import type { ExecFileSyncOptionsWithStringEncoding } from 'node:child_process';

import {
	ensureStableIdInSource,
	isStableIdContentFile,
	isValidUuid,
	listStableIdContentFiles,
	parseFrontmatter,
} from './_content-lib.ts';

interface Options {
	check: boolean;
	staged: boolean;
}

function parseArgs(argv: string[]): Options {
	const opts: Options = { check: false, staged: false };
	for (const arg of argv) {
		if (arg === '--check') opts.check = true;
		else if (arg === '--staged') opts.staged = true;
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

function help(): void {
	console.log(`Usage: node scripts/ensure-stable-ids.ts [--check] [--staged]

  --check    Validate only; do not write or stage
  --staged   Scope to staged added/modified docs (pre-commit hook)`);
}

function git(args: string[], options: Partial<ExecFileSyncOptionsWithStringEncoding> = {}): string {
	return execFileSync('git', args, { encoding: 'utf8', ...options });
}

function listStaged(): string[] {
	// Include renames (R): `git mv` of a doc without a stableId must still pass through
	// the inserter; otherwise redirect sync has no ID to match against in the base ref.
	return git(['diff', '--cached', '--name-only', '--diff-filter=AMR'])
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.filter(isStableIdContentFile);
}

// Partial-stage detection: if a file has unstaged edits, re-staging it would collapse
// a partial `git add -p` selection. Fail loudly rather than silently widen the commit.
function hasUnstagedChanges(file: string): boolean {
	try {
		git(['diff', '--quiet', '--', file], { stdio: 'ignore' });
		return false;
	}
	catch (error) {
		if ((error as { status?: number }).status === 1) return true;
		throw error;
	}
}

function reportList(label: string, files: string[]): void {
	console.error(`\n${label}:`);
	for (const file of files) console.error(`- ${file}`);
}

function main(): void {
	const opts = parseArgs(process.argv.slice(2));
	const files = opts.staged ? listStaged() : listStableIdContentFiles();

	const missingFrontmatter: string[] = [];
	const missingStableId: string[] = [];
	const invalid: Array<{ file: string; stableId: string }> = [];
	const stageConflicts: string[] = [];
	let inserted = 0;
	let present = 0;

	for (const file of files) {
		const source = opts.staged ? git(['show', `:${file}`]) : fs.readFileSync(file, 'utf8');
		const fm = parseFrontmatter(source);
		const result = ensureStableIdInSource(source, crypto.randomUUID());

		if (result.reason === 'missing-frontmatter') {
			missingFrontmatter.push(file);
			continue;
		}

		if (result.reason === 'already-present') {
			present++;
			if (typeof fm.stableId === 'string' && !isValidUuid(fm.stableId)) {
				invalid.push({ file, stableId: fm.stableId });
			}
			continue;
		}

		if (opts.check) {
			missingStableId.push(file);
			continue;
		}

		if (opts.staged && hasUnstagedChanges(file)) {
			stageConflicts.push(file);
			continue;
		}

		fs.writeFileSync(file, result.source);
		inserted++;
		if (opts.staged) git(['add', '--', file]);
	}

	console.log(`Processed: ${files.length}`);
	if (!opts.check) console.log(`Inserted: ${inserted}`);
	console.log(`Already present: ${present}`);

	let failed = false;
	if (missingFrontmatter.length) {
		failed = true;
		reportList('Missing frontmatter', missingFrontmatter);
	}
	if (missingStableId.length) {
		failed = true;
		reportList('Missing stableId', missingStableId);
		console.error('\nRun `pnpm stable-ids:ensure` to insert UUIDs.');
	}
	if (invalid.length) {
		failed = true;
		console.error('\nInvalid stableId values (must be UUID):');
		for (const { file, stableId } of invalid) console.error(`- ${file}: ${stableId}`);
	}
	if (stageConflicts.length) {
		failed = true;
		console.error('\nCannot auto-insert stableId for partially staged files with unstaged changes:');
		for (const file of stageConflicts) console.error(`- ${file}`);
		console.error('Fully stage these files, or unstage and split your commit.');
	}

	if (failed) process.exit(1);
	if (opts.check) console.log('Stable ID check passed.');
}

main();
