#!/usr/bin/env node

import fs from 'node:fs';

import { getFrontmatterBlock, isValidUuid, listInScopeContentFiles, parseFrontmatter } from './_content-lib.mjs';

function main() {
	const files = listInScopeContentFiles();
	const failures = [];

	for (const file of files) {
		const source = fs.readFileSync(file, 'utf8');
		const block = getFrontmatterBlock(source);
		if (!block) {
			failures.push({ file, reason: 'missing frontmatter' });
			continue;
		}

		const frontmatter = parseFrontmatter(source);
		if (!frontmatter.stableId) {
			failures.push({ file, reason: 'missing stableId' });
			continue;
		}

		if (!isValidUuid(frontmatter.stableId)) {
			failures.push({ file, reason: `invalid stableId: ${frontmatter.stableId}` });
		}
	}

	if (failures.length) {
		console.error('Stable ID check failed:');
		for (const failure of failures) {
			console.error(`- ${failure.file}: ${failure.reason}`);
		}
		process.exit(1);
	}

	console.log(`Stable ID check passed for ${files.length} file(s).`);
}

main();
