#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

import { ensureStableIdInSource, isInScopeContentFile, listInScopeContentFiles } from './_content-lib.mjs';

const stagedOnly = process.argv.includes('--staged');

function runGit(args) {
	return execFileSync('git', args, { encoding: 'utf8' });
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

function main() {
	const files = stagedOnly ? listStagedFiles() : listInScopeContentFiles();
	let inserted = 0;
	let alreadyPresent = 0;
	let missingFrontmatter = 0;
	let staged = 0;

	for (const file of files) {
		const source = fs.readFileSync(file, 'utf8');
		const result = ensureStableIdInSource(source, crypto.randomUUID());

		if (!result.changed) {
			if (result.reason === 'already-present') alreadyPresent++;
			else if (result.reason === 'missing-frontmatter') missingFrontmatter++;
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
}

main();
