#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

import {
	ensureStableIdInSource,
	isInScopeContentFile,
	isValidUuid,
	listInScopeContentFiles,
	parseFrontmatter,
} from './_content-lib.mjs';

const args = process.argv.slice(2);
const stagedOnly = args.includes('--staged');

if (args.includes('--help') || args.includes('-h')) {
	console.log(`ensure-stable-ids

Usage:
  node scripts/ensure-stable-ids.mjs [--staged]

Options:
  --staged   Only process staged added/modified docs
`);
	process.exit(0);
}

function runGit(args, options = {}) {
	return execFileSync('git', args, { encoding: 'utf8', ...options });
}

function listStagedFiles() {
	const output = runGit(['diff', '--cached', '--name-only', '--diff-filter=AM']);
	return output
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.filter(isInScopeContentFile);
}

function stageFile(file) {
	runGit(['add', '--', file]);
}

function readIndexedFile(file) {
	return runGit(['show', `:${file}`]);
}

function hasUnstagedChanges(file) {
	try {
		runGit(['diff', '--quiet', '--', file], { stdio: 'ignore' });
		return false;
	}
	catch (error) {
		if (error.status === 1) return true;
		throw error;
	}
}

function main() {
	const files = stagedOnly ? listStagedFiles() : listInScopeContentFiles();
	let inserted = 0;
	let alreadyPresent = 0;
	let missingFrontmatter = 0;
	let staged = 0;
	const invalidStableIds = [];
	const partialStageConflicts = [];

	for (const file of files) {
		const source = stagedOnly ? readIndexedFile(file) : fs.readFileSync(file, 'utf8');
		const result = ensureStableIdInSource(source, crypto.randomUUID());

		if (!result.changed) {
			if (result.reason === 'already-present') {
				alreadyPresent++;
				const frontmatter = parseFrontmatter(source);
				if (frontmatter.stableId && !isValidUuid(frontmatter.stableId)) {
					invalidStableIds.push({ file, stableId: frontmatter.stableId });
				}
			}
			else if (result.reason === 'missing-frontmatter') missingFrontmatter++;
			continue;
		}

		if (stagedOnly && hasUnstagedChanges(file)) {
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
	console.log(`Inserted stableId: ${inserted}`);
	console.log(`Already had stableId: ${alreadyPresent}`);
	console.log(`Missing frontmatter: ${missingFrontmatter}`);
	if (stagedOnly) {
		console.log(`Re-staged files: ${staged}`);
	}

	if (invalidStableIds.length) {
		console.error('\nFound invalid existing stableId values:');
		for (const entry of invalidStableIds) {
			console.error(`- ${entry.file}: ${entry.stableId}`);
		}
		console.error('\nFix those values manually or run `pnpm stable-ids:check` for a full repo validation pass.');
		process.exit(1);
	}

	if (partialStageConflicts.length) {
		console.error('\nCannot safely auto-insert stableId for partially staged files with unstaged changes:');
		for (const file of partialStageConflicts) {
			console.error(`- ${file}`);
		}
		console.error('\nRun `pnpm stable-ids:ensure` first, or fully stage those files before committing.');
		process.exit(1);
	}
}

main();
