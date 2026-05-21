import 'dotenv/config';
import process from 'node:process';
import { Client } from 'typesense';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections.js';
import { parseTypesenseUrl } from '../shared/utils/parseTypesenseUrl.ts';
import { resolveBranchTypesenseAlias } from '../lib/typesenseAlias.ts';
import { multiway, oneway } from '../server/data/synonyms.ts';
import { collectMarkdownDocuments, type IndexedSearchDocument } from './index-docs-chunker.ts';

interface SynonymDefinition {
	id: string;
	synonyms: string[];
	root?: string;
}

/**
 * Convert the editorial-friendly synonyms file into Typesense-shaped entries.
 * IDs are auto-derived so writers don't have to keep them unique.
 */
function buildSynonymDefinitions(): SynonymDefinition[] {
	const definitions: SynonymDefinition[] = [];

	for (const [index, terms] of multiway.entries()) {
		definitions.push({
			id: `mw-${index}-${terms[0]?.replace(/\s+/g, '-')}`,
			synonyms: [...terms],
		});
	}

	for (const [root, target] of Object.entries(oneway)) {
		definitions.push({
			id: `ow-${root.replace(/\s+/g, '-')}`,
			root,
			synonyms: [target],
		});
	}

	return definitions;
}

/**
 * Single global synonym set name, reused across every alias and slot.
 *
 * Synonyms are editorial — they live in `server/data/synonyms.ts` and are the
 * same vocabulary regardless of which collection (production, preview, dev)
 * is being indexed. Sharing one set keeps the synonym sets list in the cluster
 * clean (one entry forever instead of N × 2 per branch) and makes editorial
 * changes propagate everywhere on the next indexer run.
 */
const SYNONYM_SET_NAME = 'directus-docs-synonyms';

function isTypesenseNotFoundError(error: unknown) {
	return Boolean(
		error
		&& typeof error === 'object'
		&& 'httpStatus' in error
		&& error.httpStatus === 404,
	);
}

const COLLECTION_SCHEMA: CollectionCreateSchema = {
	name: 'directus-docs',
	enable_nested_fields: true,
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'group_id', type: 'string', facet: true },
		{ name: 'chunk_index', type: 'int32' },
		{ name: 'total_chunks', type: 'int32' },
		{ name: 'url', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'search_title', type: 'string' },
		{ name: 'description', type: 'string', optional: true },
		{ name: 'anchor', type: 'string', optional: true },
		{ name: 'heading', type: 'string', optional: true },
		{ name: 'hierarchy', type: 'string[]' },
		{ name: 'path_tokens', type: 'string' },
		{ name: 'path_depth', type: 'int32' },
		{ name: 'rank_order', type: 'int32', sort: true },
		{ name: 'section', type: 'string', facet: true },
		{ name: 'doc_type', type: 'string', facet: true },
		{ name: 'technologies', type: 'string[]', facet: true, optional: true },
		{ name: 'content', type: 'string' },
		{ name: 'code_blocks', type: 'string[]', optional: true },
		{ name: 'weight', type: 'int32' },
		{ name: 'updated_at', type: 'int64', sort: true },
	],
	default_sorting_field: 'weight',
};

function requiredEnv(name: string) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

function resolveCollectionAlias() {
	if (process.env.TYPESENSE_INDEX_TARGET) return process.env.TYPESENSE_INDEX_TARGET;

	const alias = resolveBranchTypesenseAlias();
	if (!alias) {
		throw new Error('Could not resolve Typesense index alias from branch. Set TYPESENSE_INDEX_TARGET.');
	}

	return alias;
}

function resolveTypesenseUrl() {
	return requiredEnv('TYPESENSE_URL');
}

function createClient() {
	const node = parseTypesenseUrl(resolveTypesenseUrl());
	return new Client({
		nodes: [node],
		apiKey: requiredEnv('TYPESENSE_PRIVATE_API_KEY'),
		connectionTimeoutSeconds: 300,
	});
}

async function getAliasTarget(client: Client, alias: string) {
	try {
		const existing = await client.aliases(alias).retrieve() as { collection_name?: string };
		return existing.collection_name ?? null;
	}
	catch {
		return null;
	}
}

/**
 * Resolve the next collection slot for blue/green indexing.
 *
 * We keep two fixed slots per alias (`${alias}-a` and `${alias}-b`). Each run
 * writes into whichever slot the alias is NOT currently pointing at, then
 * swaps the alias. This bounds collection count to 2 per alias forever — no
 * timestamps, no grace window, no cleanup loop drift.
 */
function resolveNextSlot(currentTarget: string | null, alias: string) {
	const slotA = `${alias}-a`;
	const slotB = `${alias}-b`;
	const next = currentTarget === slotA ? slotB : slotA;
	const previous = currentTarget && currentTarget !== next ? currentTarget : null;
	return { next, previous };
}

function stripSourcePath(document: IndexedSearchDocument) {
	const { _source_path, ...rest } = document;
	return rest;
}

async function createCollection(client: Client, collectionName: string) {
	// Slots are reused across runs, so drop any stale collection sitting in the
	// target slot before recreating it with the current schema.
	try {
		await client.collections(collectionName).delete();
	}
	catch (error) {
		if (!isTypesenseNotFoundError(error)) throw error;
	}
	await client.collections().create({
		...COLLECTION_SCHEMA,
		name: collectionName,
	});
}

async function importDocuments(client: Client, collectionName: string, documents: IndexedSearchDocument[]) {
	const response = await client.collections(collectionName).documents().import(
		documents.map(stripSourcePath),
		{ action: 'upsert', dirty_values: 'coerce_or_drop' },
	) as unknown;

	const failures: Array<{ document: IndexedSearchDocument; message: string }> = [];
	const lines = Array.isArray(response)
		? response.map(entry => JSON.stringify(entry))
		: String(response).trim().split('\n').filter(Boolean);
	for (const [index, line] of lines.entries()) {
		let parsed: { success?: boolean; error?: string };
		try {
			parsed = JSON.parse(line) as { success?: boolean; error?: string };
		}
		catch {
			failures.push({ document: documents[index]!, message: `Unparseable import response: ${line}` });
			continue;
		}
		if (!parsed.success) {
			failures.push({ document: documents[index]!, message: parsed.error || 'Unknown import failure' });
		}
	}

	return failures;
}

async function validateDocumentCount(client: Client, collectionName: string, expectedCount: number) {
	const collection = await client.collections(collectionName).retrieve() as { num_documents?: number };
	const actualCount = collection.num_documents ?? 0;
	if (actualCount !== expectedCount) {
		throw new Error(`Document count mismatch for ${collectionName}: expected ${expectedCount}, got ${actualCount}`);
	}
}

async function syncSynonyms(client: Client, collectionName: string) {
	const definitions = buildSynonymDefinitions();
	await client.synonymSets(SYNONYM_SET_NAME).upsert({ items: definitions });
	await client.collections(collectionName).update({ synonym_sets: [SYNONYM_SET_NAME] });
}

async function swapAlias(client: Client, alias: string, collectionName: string) {
	await client.aliases().upsert(alias, { collection_name: collectionName });
}

async function deletePreviousSlot(client: Client, previousCollection: string | null) {
	if (!previousCollection) return;
	try {
		await client.collections(previousCollection).delete();
		console.log(`Deleted previous slot ${previousCollection}`);
	}
	catch (error) {
		if (!isTypesenseNotFoundError(error)) throw error;
	}
	// Synonym set is global (SYNONYM_SET_NAME), not per-slot — nothing to clean up here.
}

function printFailures(failures: Array<{ file: string; error: string }>) {
	if (failures.length === 0) return;
	console.error('Markdown chunking failures:');
	for (const failure of failures) {
		console.error(`- ${failure.file}: ${failure.error}`);
	}
}

function printImportFailures(failures: Array<{ document: IndexedSearchDocument; message: string }>) {
	if (failures.length === 0) return;
	console.error('Typesense import failures:');
	for (const failure of failures) {
		console.error(`- ${failure.document._source_path ?? failure.document.id}: ${failure.message}`);
	}
}

async function main() {
	const alias = resolveCollectionAlias();
	if (alias === 'directus-docs' && !process.env.GITHUB_ACTIONS) {
		throw new Error('Refusing to write prod alias from local. Use TYPESENSE_INDEX_TARGET to override.');
	}

	const client = createClient();
	const currentTarget = await getAliasTarget(client, alias);
	const { next: nextCollection, previous: previousCollection } = resolveNextSlot(currentTarget, alias);

	console.log(`Target alias: ${alias}`);
	console.log(`Writing to slot: ${nextCollection}`);
	if (currentTarget) console.log(`Current alias target: ${currentTarget}`);

	const markdown = collectMarkdownDocuments();
	printFailures(markdown.failures);

	const documents = markdown.documents;
	console.log(`Markdown pages indexed: ${markdown.filesIndexed}`);
	console.log('OAS indexing deferred to the OpenAPI/API reference PR.');
	console.log(`Total chunks prepared: ${documents.length}`);

	if (markdown.failures.length > 0) {
		throw new Error(`Aborting due to ${markdown.failures.length} markdown chunking failures`);
	}

	await createCollection(client, nextCollection);
	await syncSynonyms(client, nextCollection);

	const importFailures = await importDocuments(client, nextCollection, documents);
	printImportFailures(importFailures);
	if (importFailures.length > 0) {
		throw new Error(`Aborting due to ${importFailures.length} Typesense import failures`);
	}

	await validateDocumentCount(client, nextCollection, documents.length);
	await swapAlias(client, alias, nextCollection);
	await deletePreviousSlot(client, previousCollection);

	console.log(`Alias ${alias} now points to ${nextCollection}`);
	console.log('Index complete');
}

main().catch(async (error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
