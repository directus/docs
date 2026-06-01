#!/usr/bin/env node

import fs from 'node:fs';

import { getFrontmatterBlock, isValidUuid, listInScopeContentFiles, parseFrontmatter } from './_content-lib.ts';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
	console.log(`check-stable-ids

Usage:
  node scripts/check-stable-ids.ts
`);
	process.exit(0);
}

interface CheckFailure {
	file: string;
	reason: string;
}

type FailureCategory = 'missing frontmatter' | 'missing stableId' | 'invalid stableId';

function main(): void {
	const files = listInScopeContentFiles();
	const failures: CheckFailure[] = [];
	const counts: Record<FailureCategory, number> = { 'missing frontmatter': 0, 'missing stableId': 0, 'invalid stableId': 0 };

	for (const file of files) {
		const source = fs.readFileSync(file, 'utf8');
		const block = getFrontmatterBlock(source);
		if (!block) {
			failures.push({ file, reason: 'missing frontmatter' });
			counts['missing frontmatter']++;
			continue;
		}

		const frontmatter = parseFrontmatter(source);
		if (!frontmatter.stableId) {
			failures.push({ file, reason: 'missing stableId' });
			counts['missing stableId']++;
			continue;
		}

		if (!isValidUuid(frontmatter.stableId)) {
			failures.push({ file, reason: `invalid stableId: ${frontmatter.stableId}` });
			counts['invalid stableId']++;
		}
	}

	const total = files.length;
	const failing = failures.length;
	const passing = total - failing;

	if (failing) {
		console.error('Stable ID check failed:');
		for (const failure of failures) {
			console.error(`- ${failure.file}: ${failure.reason}`);
		}
		const breakdown = Object.entries(counts)
			.filter(([, count]) => count > 0)
			.map(([reason, count]) => `${count} ${reason}`)
			.join(', ');
		console.error(`\nTotal files: ${total}`);
		console.error(`Passing: ${passing}`);
		console.error(`Failing: ${failing} (${breakdown})`);
		console.error('\nFix the files above and re-run the command.');
		process.exit(1);
	}

	console.log(`Total files: ${total}`);
	console.log(`Passing: ${passing}`);
	console.log(`Failing: 0`);
	console.log(`Stable ID check passed.`);
}

main();
