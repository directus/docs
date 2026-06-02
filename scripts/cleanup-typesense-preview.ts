import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { Client } from 'typesense';
import { parseTypesenseUrl } from '../shared/utils/parseTypesenseUrl.ts';
import {
	resolveBranchTypesenseAlias,
	slugifyBranch,
	TYPESENSE_PREVIEW_ALIAS_PREFIX,
} from '../lib/typesenseAlias.ts';

export interface CollectionAlias {
	name: string;
	collection_name: string;
}

export interface Options {
	branch?: string;
	stale: boolean;
	dryRun: boolean;
}

function requiredEnv(name: string) {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required environment variable: ${name}`);
	return value;
}

function createClient() {
	const node = parseTypesenseUrl(requiredEnv('TYPESENSE_URL'));
	return new Client({
		nodes: [node],
		apiKey: requiredEnv('TYPESENSE_PRIVATE_API_KEY'),
		connectionTimeoutSeconds: 300,
	});
}

function isTypesenseNotFoundError(error: unknown) {
	return Boolean(
		error
		&& typeof error === 'object'
		&& 'httpStatus' in error
		&& error.httpStatus === 404,
	);
}

export function parseArgs(argv = process.argv.slice(2), env = process.env): Options {
	const options: Options = {
		branch: env.TYPESENSE_PREVIEW_BRANCH,
		stale: false,
		dryRun: env.TYPESENSE_CLEANUP_DRY_RUN === 'true',
	};

	for (let index = 0; index < argv.length; index++) {
		const arg = argv[index];
		if (arg === '--branch') {
			const branch = argv[++index];
			if (!branch || branch.startsWith('--')) throw new Error('--branch requires a branch name');
			options.branch = branch;
			continue;
		}
		if (arg === '--stale') {
			options.stale = true;
			continue;
		}
		if (arg === '--dry-run') {
			options.dryRun = true;
			continue;
		}
		throw new Error(`Unknown argument: ${arg}`);
	}

	if (options.branch && options.stale) throw new Error('Use either --branch or --stale, not both.');
	if (!options.branch && !options.stale) throw new Error('Set --branch <branch> or --stale.');
	return options;
}

async function listAliases(client: Client) {
	const response = await client.aliases().retrieve() as { aliases?: CollectionAlias[] };
	return response.aliases ?? [];
}

async function listCollectionNames(client: Client) {
	const collections = await client.collections().retrieve({ exclude_fields: 'fields' }) as Array<{ name: string }>;
	return collections.map(collection => collection.name);
}

async function deleteAlias(client: Client, alias: string, dryRun: boolean) {
	if (dryRun) {
		console.log(`[dry-run] Delete alias ${alias}`);
		return;
	}
	try {
		await client.aliases(alias).delete();
		console.log(`Deleted alias ${alias}`);
	}
	catch (error) {
		if (!isTypesenseNotFoundError(error)) throw error;
	}
}

async function deleteCollection(client: Client, collection: string, dryRun: boolean) {
	if (dryRun) {
		console.log(`[dry-run] Delete collection ${collection}`);
		return;
	}
	try {
		await client.collections(collection).delete();
		console.log(`Deleted collection ${collection}`);
	}
	catch (error) {
		if (!isTypesenseNotFoundError(error)) throw error;
	}
}

export async function cleanupAlias(client: Client, alias: string, dryRun: boolean, existingAlias?: CollectionAlias | null) {
	if (!alias.startsWith(TYPESENSE_PREVIEW_ALIAS_PREFIX)) {
		throw new Error(`Refusing to clean non-preview alias: ${alias}`);
	}

	const collections = new Set([`${alias}-a`, `${alias}-b`]);
	if (existingAlias?.collection_name) collections.add(existingAlias.collection_name);

	await deleteAlias(client, alias, dryRun);
	for (const collection of collections) {
		await deleteCollection(client, collection, dryRun);
	}
}

function getOpenBranchesFromEnv(env = process.env) {
	const raw = env.TYPESENSE_OPEN_PREVIEW_BRANCHES;
	if (!raw) return null;
	return raw
		.split(/[\n,]/)
		.map(branch => branch.trim())
		.filter(Boolean);
}

function getOpenPrBranches(env = process.env) {
	const envBranches = getOpenBranchesFromEnv(env);
	if (envBranches) return envBranches;

	const output = execFileSync('gh', [
		'pr',
		'list',
		'--state',
		'open',
		'--json',
		'headRefName',
		'--jq',
		'.[].headRefName',
	], { encoding: 'utf8' });

	return output
		.split('\n')
		.map(branch => branch.trim())
		.filter(Boolean);
}

export function aliasFromSlot(collectionName: string) {
	if (!collectionName.startsWith(TYPESENSE_PREVIEW_ALIAS_PREFIX)) return null;
	if (collectionName.endsWith('-a') || collectionName.endsWith('-b')) return collectionName.slice(0, -2);
	return null;
}

async function cleanupStale(client: Client, dryRun: boolean) {
	const openAliases = new Set(
		getOpenPrBranches()
			.map(branch => `${TYPESENSE_PREVIEW_ALIAS_PREFIX}${slugifyBranch(branch)}`),
	);

	const aliases = await listAliases(client);
	const previewAliases = aliases.filter(alias => alias.name.startsWith(TYPESENSE_PREVIEW_ALIAS_PREFIX));
	const previewAliasNames = new Set(previewAliases.map(alias => alias.name));
	const collectionNames = await listCollectionNames(client);
	const orphanAliases = collectionNames
		.map(aliasFromSlot)
		.filter((alias): alias is string => Boolean(alias))
		.filter(alias => !previewAliasNames.has(alias));

	const staleAliases = new Map<string, CollectionAlias | null>();
	for (const alias of previewAliases) {
		if (!openAliases.has(alias.name)) staleAliases.set(alias.name, alias);
	}
	for (const alias of orphanAliases) {
		if (!openAliases.has(alias)) staleAliases.set(alias, null);
	}

	if (staleAliases.size === 0) {
		console.log('No stale preview aliases found');
		return;
	}

	for (const [alias, existingAlias] of staleAliases) {
		await cleanupAlias(client, alias, dryRun, existingAlias);
	}
}

export async function main() {
	const options = parseArgs();
	const client = createClient();

	if (options.branch) {
		const alias = resolveBranchTypesenseAlias(options.branch);
		if (!alias) throw new Error(`Could not resolve preview alias for branch: ${options.branch}`);
		const existingAlias = (await listAliases(client)).find(candidate => candidate.name === alias) ?? null;
		await cleanupAlias(client, alias, options.dryRun, existingAlias);
		return;
	}

	await cleanupStale(client, options.dryRun);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	});
}
