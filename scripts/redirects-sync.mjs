#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { listRoutableContentFiles, parseFrontmatter } from './_content-lib.mjs';

const DEFAULTS = {
	base: 'origin/main',
	manifest: 'redirects.csv',
	hints: '.docs/redirect-hints.json',
	suggest: '.docs/redirect-decisions-needed.json',
	acceptHighConfidence: false,
	failOnUnresolved: false,
	noWrite: false,
};

function parseArgs(argv) {
	const options = { ...DEFAULTS };

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--base') options.base = argv[++i];
		else if (arg === '--manifest') options.manifest = argv[++i];
		else if (arg === '--hints') options.hints = argv[++i];
		else if (arg === '--suggest') options.suggest = argv[++i];
		else if (arg === '--accept-high-confidence') options.acceptHighConfidence = true;
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

function printHelp() {
	console.log(`redirects-sync

Usage:
  node scripts/redirects-sync.mjs [options]

Options:
  --base <git-ref>          Base git ref to diff against (default: origin/main)
  --manifest <file>         Redirect manifest CSV (default: redirects.csv)
  --hints <file>            Manual redirect hints JSON (default: .docs/redirect-hints.json)
  --suggest <file>          Decisions-needed report (default: .docs/redirect-decisions-needed.json)
  --accept-high-confidence  Auto-append deterministic redirects to the manifest
  --fail-on-unresolved      Exit non-zero if unresolved routes remain
  --no-write                Do not write manifest or report files
`);
}

function runGit(args, options = {}) {
	try {
		return execFileSync('git', args, { encoding: 'utf8', ...options });
	}
	catch (error) {
		const details = error.stderr?.toString?.() || error.message;
		throw new Error(`git ${args.join(' ')} failed:\n${details}`);
	}
}

function assertBaseRefExists(baseRef) {
	try {
		runGit(['rev-parse', '--verify', baseRef], { stdio: 'ignore' });
	}
	catch {
		throw new Error(`Base ref ${baseRef} does not exist locally. Run \`git fetch origin main\` or pass a different --base ref.`);
	}
}

function listBaseContentFiles(baseRef) {
	const output = runGit(['ls-tree', '-r', '--name-only', baseRef, '--', 'content']);
	return output
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.filter(file => file.endsWith('.md'))
		.filter(file => !file.startsWith('content/_partials/'));
}

function readBaseFile(baseRef, file) {
	return runGit(['show', `${baseRef}:${file}`]);
}

function readCurrentFile(file) {
	return fs.readFileSync(file, 'utf8');
}

function stripNumericPrefix(segment) {
	return segment.replace(/^\d+\./, '');
}

function buildPublicPath(file, frontmatter = {}) {
	if (typeof frontmatter.path === 'string' && frontmatter.path.trim()) {
		return normalizePublicPath(frontmatter.path.trim());
	}

	const relative = file.replace(/^content\//, '');
	const parts = relative.split('/');
	const fileName = parts.pop();
	const fileStem = stripNumericPrefix(fileName.replace(/\.[^.]+$/, ''));
	const pathParts = parts.map(stripNumericPrefix).filter(Boolean);

	if (fileStem !== 'index') {
		pathParts.push(fileStem);
	}

	return normalizePublicPath(`/${pathParts.join('/')}`);
}

function normalizePublicPath(routePath) {
	if (!routePath || routePath === '/') return '/';
	const normalized = `/${routePath.replace(/^\/+/, '').replace(/\/+$/, '')}`;
	return normalized === '/index' ? '/' : normalized;
}

function toSnapshotItem(file, source, collection = 'content') {
	const frontmatter = parseFrontmatter(source);
	const publicPath = buildPublicPath(file, frontmatter);

	return {
		collection,
		path: publicPath,
		sourceFile: file,
		title: frontmatter.title,
		stableId: frontmatter.stableId,
	};
}

function loadCurrentSnapshot() {
	const files = listRoutableContentFiles();
	return files.map(file => {
		const collection = file === 'content/index.md' ? 'landing' : 'content';
		return toSnapshotItem(file, readCurrentFile(file), collection);
	});
}

function loadBaseSnapshot(baseRef) {
	const files = listBaseContentFiles(baseRef);
	return files.map(file => {
		const collection = file === 'content/index.md' ? 'landing' : 'content';
		return toSnapshotItem(file, readBaseFile(baseRef, file), collection);
	});
}

function indexByPath(items) {
	return new Map(items.map(item => [item.path, item]));
}

function indexByStableId(items) {
	const byStableId = new Map();
	for (const item of items) {
		if (!item.stableId) continue;
		const matches = byStableId.get(item.stableId) || [];
		matches.push(item);
		byStableId.set(item.stableId, matches);
	}
	return byStableId;
}

function loadRedirectManifest(file) {
	if (!fs.existsSync(file)) {
		return { rows: [], fromSet: new Set() };
	}

	const text = fs.readFileSync(file, 'utf8').trim();
	if (!text) return { rows: [], fromSet: new Set() };

	const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
	const rows = [];
	const seen = new Set();

	for (let index = 1; index < lines.length; index++) {
		const [from, to, status] = splitCsvLine(lines[index]);
		if (!from || !to || !status) continue;
		if (seen.has(from)) {
			throw new Error(`Duplicate redirect source in ${file}: ${from}`);
		}
		seen.add(from);
		rows.push({ from, to, status });
	}

	return { rows, fromSet: seen };
}

function splitCsvLine(line) {
	const parts = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '"') {
			inQuotes = !inQuotes;
			continue;
		}
		if (char === ',' && !inQuotes) {
			parts.push(current);
			current = '';
			continue;
		}
		current += char;
	}
	parts.push(current);
	return parts.map(part => part.trim());
}

function ensureManifest(file) {
	if (!fs.existsSync(file)) {
		fs.writeFileSync(file, 'from,to,status\n');
	}
}

function loadHints(file) {
	if (!fs.existsSync(file)) {
		return { manualRedirects: {} };
	}

	const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
	return {
		manualRedirects: parsed.manualRedirects || {},
	};
}

function csvValue(value) {
	const stringValue = String(value ?? '');
	return /[",\n]/.test(stringValue)
		? `"${stringValue.replaceAll('"', '""')}"`
		: stringValue;
}

function appendRedirectRows(file, rows) {
	if (!rows.length) return;
	ensureManifest(file);
	const text = rows.map(row => [row.from, row.to, row.status].map(csvValue).join(',')).join('\n') + '\n';
	fs.appendFileSync(file, text);
}

function resolveRemovedRoute(oldPage, currentByStableId, manualRedirects) {
	const manualTarget = manualRedirects[oldPage.path];
	if (manualTarget) {
		return {
			status: 'accepted',
			from: oldPage.path,
			to: manualTarget,
			reason: 'manual redirect hint',
			old: oldPage,
			matches: [],
		};
	}

	if (!oldPage.stableId) {
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
			reason: 'same stableId',
			old: oldPage,
			matches,
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

function writeDecisionArtifacts(file, unresolved, summary) {
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

function buildDecisionMarkdown(payload) {
	const lines = [
		'# Redirect Decisions Needed',
		'',
		`Generated: ${payload.generatedAt}`,
		'',
		`- Unresolved routes: ${payload.summary.unresolvedRoutes}`,
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

function main() {
	const options = parseArgs(process.argv.slice(2));
	assertBaseRefExists(options.base);
	const hints = loadHints(options.hints);
	const manifest = loadRedirectManifest(options.manifest);
	const basePages = loadBaseSnapshot(options.base);
	const currentPages = loadCurrentSnapshot();

	const baseByPath = indexByPath(basePages);
	const currentByPath = indexByPath(currentPages);
	const currentByStableId = indexByStableId(currentPages);

	const removed = [...baseByPath.values()].filter(page => !currentByPath.has(page.path));
	const uncoveredRemoved = removed.filter(page => !manifest.fromSet.has(page.path));

	const accepted = [];
	const unresolved = [];

	for (const oldPage of uncoveredRemoved) {
		const resolution = resolveRemovedRoute(oldPage, currentByStableId, hints.manualRedirects);
		if (resolution.status === 'accepted') accepted.push(resolution);
		else unresolved.push(resolution);
	}

	const rowsToWrite = options.acceptHighConfidence
		? accepted.filter(row => !manifest.fromSet.has(row.from)).map(row => ({ from: row.from, to: row.to, status: 301 }))
		: [];

	const summary = {
		baseRef: options.base,
		basePages: basePages.length,
		currentPages: currentPages.length,
		removedRoutes: removed.length,
		uncoveredRemovedRoutes: uncoveredRemoved.length,
		autoRedirects: accepted.length,
		unresolvedRoutes: unresolved.length,
	};

	if (!options.noWrite) {
		appendRedirectRows(options.manifest, rowsToWrite);
		writeDecisionArtifacts(options.suggest, unresolved, summary);
	}

	console.log(`Base ref: ${summary.baseRef}`);
	console.log(`Base pages: ${summary.basePages}`);
	console.log(`Current pages: ${summary.currentPages}`);
	console.log(`Removed routes: ${summary.removedRoutes}`);
	console.log(`Uncovered removed routes: ${summary.uncoveredRemovedRoutes}`);
	console.log(`Auto redirects: ${summary.autoRedirects}`);
	console.log(`Unresolved routes: ${summary.unresolvedRoutes}`);

	if (rowsToWrite.length) {
		console.log(`Appended ${rowsToWrite.length} redirect(s) to ${options.manifest}`);
	}
	if (unresolved.length && !options.noWrite) {
		console.log(`Review manual redirect decisions in ${options.suggest.replace(/\.json$/i, '.md')}`);
	}

	if (unresolved.length) {
		console.error('\nUnresolved routes:');
		for (const item of unresolved.slice(0, 20)) {
			console.error(`- ${item.old.path}: ${item.reason}`);
		}
	}

	if (options.failOnUnresolved && unresolved.length > 0) {
		process.exit(1);
	}
}

main();
