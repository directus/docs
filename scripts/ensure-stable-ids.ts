#!/usr/bin/env node

import type { ExecFileSyncOptionsWithStringEncoding } from 'node:child_process';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

import {
	ensureStableIdInSource,
	isInScopeContentFile,
	isValidUuid,
	listInScopeContentFiles,
	parseFrontmatter,
} from './_content-lib.ts';

const args = process.argv.slice(2);
const stagedOnly = args.includes('--staged');

if (args.includes('--help') || args.includes('-h')) {
	console.log(`ensure-stable-ids

Usage:
  node scripts/ensure-stable-ids.ts [--staged]

Options:
  --staged   Only process staged added/modified docs
`);
	process.exit(0);
}

interface InvalidEntry {
	file: string;
	stableId: string;
}

function runGit(args: string[], options: Partial<ExecFileSyncOptionsWithStringEncoding> = {}): string {
	return execFileSync('git', args, { encoding: 'utf8', ...options });
}

function listStagedFiles(): string[] {
	const output = runGit(['diff', '--cached', '--name-only', '--diff-filter=AM']);
	return output
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.filter(isInScopeContentFile);
}

function stageFile(file: string): void {
	runGit(['add', '--', file]);
}

/**
 * In hook mode we read the staged blob from the index, not the working tree, so ID
 * insertion reflects what is actually being committed.
 */
function readIndexedFile(file: string): string {
	return runGit(['show', `:${file}`]);
}

/**
 * If a file has unstaged edits, re-staging it would collapse a partial `git add -p`
 * selection into a full-file stage. We abort instead of trying to outsmart git here.
 */
function hasUnstagedChanges(file: string): boolean {
	try {
		runGit(['diff', '--quiet', '--', file], { stdio: 'ignore' });
		return false;
	}
	catch (error) {
		if ((error as { status?: number }).status === 1) return true;
		throw error;
	}
}

function main(): void {
	const files = stagedOnly ? listStagedFiles() : listInScopeContentFiles();
	let inserted = 0;
	let alreadyPresent = 0;
	let missingFrontmatter = 0;
	let staged = 0;
	const invalidStableIds: InvalidEntry[] = [];
	const partialStageConflicts: string[] = [];

	for (const file of files) {
		const source = stagedOnly ? readIndexedFile(file) : fs.readFileSync(file, 'utf8');
		const result = ensureStableIdInSource(source, crypto.randomUUID());

		if (!result.changed) {
			if (result.reason === 'already-present') {
				alreadyPresent++;
				const frontmatter = parseFrontmatter(source);
				const stableId = frontmatter.stableId;
				if (typeof stableId === 'string' && !isValidUuid(stableId)) {
					invalidStableIds.push({ file, stableId });
				}
			}
			else if (result.reason === 'missing-frontmatter') missingFrontmatter++;
			continue;
		}

		if (stagedOnly && hasUnstagedChanges(file)) {
			// Failing is safer than silently widening the staged diff.
			partialStageConflicts.push(file);
			continue;
		}

		fs.writeFileSync(file, result.source);
		inserted++;

		if (stagedOnly) {
			stageFile(file);
			staged++;
		}
	}

	console.log(`Processed files: ${files.length}`);
	console.log(`Inserted stable IDs: ${inserted}`);
	console.log(`Already had stable IDs: ${alreadyPresent}`);
	console.log(`Skipped (missing frontmatter): ${missingFrontmatter}`);
	if (stagedOnly) {
		console.log(`Re-staged files: ${staged}`);
	}

	if (invalidStableIds.length) {
		console.error('\nFound invalid existing stableId values:');
		for (const entry of invalidStableIds) {
			console.error(`- ${entry.file}: ${entry.stableId}`);
		}
		console.error('\nFix those values manually, then re-run the command or use `pnpm stable-ids:check` for a full repo validation pass.');
		process.exit(1);
	}

	if (partialStageConflicts.length) {
		console.error('\nCannot safely auto-insert stableId for partially staged files with unstaged changes:');
		for (const file of partialStageConflicts) {
			console.error(`- ${file}`);
		}
		console.error('\nFully stage these files, or unstage and split your commit.');
		process.exit(1);
	}
}

main();
