import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import { load as loadYaml } from 'js-yaml';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkMdc from 'remark-mdc';
import { findSectionByPath } from '../shared/utils/docsSections.ts';
import { listRoutableContentFiles } from './_content-lib.ts';

const CONTENT_DIR = path.resolve('content');
const PARTIALS_DIR = path.join(CONTENT_DIR, '_partials');
const MAX_PARTIAL_DEPTH = 8;
const MAX_CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 150;
const YAML_OPTIONS = { json: true } as const;

interface MarkdownFrontmatter {
	title?: string;
	description?: string;
	technologies?: string[];
}

interface MarkdownSection {
	h2?: string;
	h3?: string;
	textParts: string[];
	codeBlocks: string[];
}

interface RawChunk {
	url: string;
	anchor?: string;
	heading?: string;
	hierarchy: string[];
	content: string;
	code_blocks?: string[];
	weight: number;
	level: number;
	position: number;
}

export interface IndexedSearchDocument {
	id: string;
	group_id: string;
	chunk_index: number;
	total_chunks: number;
	url: string;
	title: string;
	search_title: string;
	description?: string;
	anchor?: string;
	heading?: string;
	hierarchy: string[];
	path_tokens: string;
	path_depth: number;
	rank_order: number;
	section: string;
	doc_type: 'page' | 'api-operation' | 'api-tag';
	technologies?: string[];
	content: string;
	code_blocks?: string[];
	weight: number;
	updated_at: number;
	_source_path?: string;
}

interface ChunkMarkdownPageOptions {
	sourcePath: string;
	updatedAt: number;
	partials: Map<string, string>;
}

interface MdastNode {
	type: string;
	name?: string;
	depth?: number;
	value?: string;
	url?: string;
	children?: MdastNode[];
	attributes?: Record<string, unknown>;
	rawData?: string;
}

interface ExtractedBlock {
	type: 'heading' | 'paragraph' | 'code';
	depth?: number;
	text: string;
}

function stripNumericPrefix(segment: string): string {
	return segment.replace(/^\d+\./, '');
}

function normalizePublicPath(routePath: string): string {
	if (!routePath || routePath === '/') return '/';
	const normalized = `/${routePath.replace(/^\/+/, '').replace(/\/+$/, '')}`;
	return normalized === '/index' ? '/' : normalized;
}

export function contentPathToPublicPath(file: string): string {
	const relative = file.replace(/^content\//, '');
	const parts = relative.split('/');
	const fileName = parts.pop() ?? '';
	const fileStem = stripNumericPrefix(fileName.replace(/\.[^.]+$/, ''));
	const pathParts = parts.map(stripNumericPrefix).filter(Boolean);

	if (fileStem !== 'index') {
		pathParts.push(fileStem);
	}

	return normalizePublicPath(`/${pathParts.join('/')}`);
}

function toSearchUrl(routePath: string, anchor?: string) {
	const normalized = routePath === '/' ? '' : routePath;
	return `/docs${normalized}${anchor ? `#${anchor}` : ''}` || '/docs';
}

const GENERIC_TITLES = new Set(['overview', 'installation', 'security', 'troubleshooting', 'introduction']);
const ACRONYMS: Record<string, string> = {
	ai: 'AI',
	api: 'API',
	mcp: 'MCP',
	sdk: 'SDK',
	sso: 'SSO',
};

function isGenericTitle(title: string) {
	return GENERIC_TITLES.has(title.trim().toLowerCase());
}

function humanizeSegment(segment: string) {
	return segment
		.split('-')
		.map(part => ACRONYMS[part.toLowerCase()] ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join(' ')
		.trim();
}

function buildPathTokens(routePath: string, anchor?: string) {
	const segments = routePath.split('/').filter(Boolean);
	const anchorTokens = anchor ? anchor.split('-') : [];
	return [...segments, ...anchorTokens]
		.flatMap(segment => segment.split('-'))
		.map(segment => segment.trim())
		.filter(Boolean)
		.map(segment => ACRONYMS[segment.toLowerCase()] ?? segment)
		.join(' ');
}

function getPathDepth(routePath: string) {
	return routePath.split('/').filter(Boolean).length;
}

function buildRankOrder(routePath: string, level: number, position: number) {
	return (getPathDepth(routePath) * 1000) + (level * 100) + position;
}

function buildPageSearchTitle(routePath: string, title: string) {
	if (!isGenericTitle(title)) return title;
	const segments = routePath.split('/').filter(Boolean);
	const last = segments.at(-1);
	const contextSegment = last && !GENERIC_TITLES.has(last) ? last : segments.at(-2);
	const contextLabel = contextSegment ? humanizeSegment(contextSegment) : '';
	return contextLabel ? `${contextLabel} ${title}` : title;
}

function buildChunkSearchTitle(pageSearchTitle: string, heading?: string) {
	return heading?.trim() || pageSearchTitle;
}

function buildSectionAnchors(sections: MarkdownSection[]) {
	const slugger = new GithubSlugger();
	return sections.map((section) => {
		const heading = section.h3 ?? section.h2;
		return heading ? slugger.slug(heading) : undefined;
	});
}

function normalizeText(value: string): string {
	return value
		.replace(/\u00a0/g, ' ')
		.replace(/[\t\r ]+/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function normalizeCode(value: string): string {
	return value.replace(/\r/g, '').trim();
}

function cleanSentence(value: string): string {
	return normalizeText(value.replace(/\s+/g, ' '));
}

function readPartialFiles(dir = PARTIALS_DIR, prefix = ''): Array<[string, string]> {
	if (!fs.existsSync(dir)) return [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const partials: Array<[string, string]> = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		const nextPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			partials.push(...readPartialFiles(fullPath, nextPrefix));
			continue;
		}

		if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
		const key = nextPrefix.replace(/\.md$/, '');
		const source = fs.readFileSync(fullPath, 'utf8');
		partials.push([key, matter(source, { engines: { yaml: value => loadYaml(value, YAML_OPTIONS) as Record<string, unknown> } }).content]);
	}

	return partials;
}

export function loadPartials() {
	return new Map(readPartialFiles());
}

function resolvePartialContent(name: string, partials: Map<string, string>): string | null {
	const normalized = name.replace(/^\/_partials\//, '').replace(/^_partials\//, '').replace(/\.md$/, '');
	return partials.get(normalized) ?? null;
}

function parseComponentMeta(rawData?: string, attributes?: Record<string, unknown>): string[] {
	const values: string[] = [];
	const push = (value: unknown) => {
		if (typeof value !== 'string') return;
		const cleaned = normalizeText(value);
		if (cleaned) values.push(cleaned);
	};

	push(attributes?.title);
	push(attributes?.description);
	push(attributes?.label);
	push(attributes?.command);

	if (rawData) {
		const cleanedRaw = rawData
			.replace(/^-+\s*/, '')
			.replace(/\s*-+\s*$/, '')
			.split('\n')
			.map(line => line.replace(/^\s{2}/, ''))
			.join('\n')
			.trim();
		if (cleanedRaw) {
			const parsed = loadYaml(cleanedRaw) as Record<string, unknown> | undefined;
			push(parsed?.title);
			push(parsed?.description);
			push(parsed?.label);
		}
	}

	return [...new Set(values)];
}

function extractInlineText(node: MdastNode, partials: Map<string, string>, depth: number): string {
	switch (node.type) {
		case 'text':
		case 'inlineCode':
			return node.value ?? '';
		case 'link':
		case 'strong':
		case 'emphasis':
		case 'delete':
		case 'paragraph':
		case 'heading':
			return (node.children ?? []).map(child => extractInlineText(child, partials, depth)).join(' ');
		case 'break':
			return ' ';
		case 'textComponent':
		case 'leafComponent': {
			if (node.name === 'doc-cli-snippet') {
				return typeof node.attributes?.command === 'string' ? node.attributes.command : '';
			}
			if (node.name === 'partial') {
				const partialName = typeof node.attributes?.content === 'string' ? node.attributes.content : '';
				const partial = partialName ? resolvePartialContent(partialName, partials) : null;
				if (!partial || depth >= MAX_PARTIAL_DEPTH) return '';
				return extractInlineTextFromMarkdown(partial, partials, depth + 1);
			}
			return parseComponentMeta(node.rawData, node.attributes).join(' ');
		}
		default:
			return (node.children ?? []).map(child => extractInlineText(child, partials, depth)).join(' ');
	}
}

function extractInlineTextFromMarkdown(markdown: string, partials: Map<string, string>, depth: number) {
	const tree = remark().use(remarkParse).use(remarkMdc).parse(markdown) as { children: MdastNode[] };
	return tree.children.map(child => extractInlineText(child, partials, depth)).join(' ');
}

function extractBlocks(nodes: MdastNode[], partials: Map<string, string>, depth = 0): ExtractedBlock[] {
	const blocks: ExtractedBlock[] = [];

	for (const node of nodes) {
		switch (node.type) {
			case 'heading': {
				const text = cleanSentence(extractInlineText(node, partials, depth));
				if (text) blocks.push({ type: 'heading', depth: node.depth, text });
				break;
			}
			case 'paragraph': {
				const text = cleanSentence(extractInlineText(node, partials, depth));
				if (text) blocks.push({ type: 'paragraph', text });
				break;
			}
			case 'list': {
				for (const child of node.children ?? []) {
					const text = cleanSentence(extractInlineText(child, partials, depth));
					if (text) blocks.push({ type: 'paragraph', text: `- ${text}` });
				}
				break;
			}
			case 'table': {
				for (const row of node.children ?? []) {
					const text = cleanSentence(extractInlineText(row, partials, depth));
					if (text) blocks.push({ type: 'paragraph', text });
				}
				break;
			}
			case 'code': {
				const code = normalizeCode(node.value ?? '');
				if (code) blocks.push({ type: 'code', text: code });
				break;
			}
			case 'textComponent':
			case 'leafComponent': {
				if (node.name === 'partial') {
					const partialName = typeof node.attributes?.content === 'string' ? node.attributes.content : '';
					const partial = partialName ? resolvePartialContent(partialName, partials) : null;
					if (!partial) {
						blocks.push({ type: 'paragraph', text: `[Missing partial: ${partialName}]` });
						break;
					}
					if (depth >= MAX_PARTIAL_DEPTH) break;
					const partialTree = remark().use(remarkParse).use(remarkMdc).parse(partial) as { children: MdastNode[] };
					blocks.push(...extractBlocks(partialTree.children, partials, depth + 1));
					break;
				}
				if (node.name === 'doc-cli-snippet') {
					const command = typeof node.attributes?.command === 'string' ? normalizeCode(node.attributes.command) : '';
					if (command) blocks.push({ type: 'code', text: command });
					break;
				}
				const meta = parseComponentMeta(node.rawData, node.attributes).join('\n\n');
				if (meta) blocks.push({ type: 'paragraph', text: meta });
				break;
			}
			case 'containerComponent': {
				const meta = parseComponentMeta(node.rawData, node.attributes);
				for (const value of meta) {
					blocks.push({ type: 'paragraph', text: value });
				}
				blocks.push(...extractBlocks(node.children ?? [], partials, depth));
				break;
			}
			default:
				if (node.children?.length) {
					blocks.push(...extractBlocks(node.children, partials, depth));
				}
		}
	}

	return blocks;
}

function blocksToSections(blocks: ExtractedBlock[]) {
	const sections: MarkdownSection[] = [];
	let current: MarkdownSection = { textParts: [], codeBlocks: [] };

	const flush = () => {
		if (current.h2 || current.h3 || current.textParts.length || current.codeBlocks.length) {
			sections.push(current);
		}
	};

	for (const block of blocks) {
		if (block.type === 'heading') {
			if (block.depth === 2) {
				flush();
				current = { h2: block.text, textParts: [], codeBlocks: [] };
				continue;
			}
			if (block.depth === 3) {
				flush();
				current = { h2: current.h2, h3: block.text, textParts: [], codeBlocks: [] };
				continue;
			}
		}

		if (block.type === 'code') {
			current.codeBlocks.push(block.text);
			continue;
		}

		current.textParts.push(block.text);
	}

	flush();
	return sections;
}

function splitLongText(text: string, maxLength: number): string[] {
	const normalized = normalizeText(text);
	if (normalized.length <= maxLength) return [normalized];

	const sentences = normalized.split(/(?<=[.!?])\s+/).map(cleanSentence).filter(Boolean);
	if (sentences.length <= 1) {
		const words = normalized.split(/\s+/);
		const chunks: string[] = [];
		let current = '';
		for (const word of words) {
			const next = current ? `${current} ${word}` : word;
			if (next.length > maxLength && current) {
				chunks.push(current);
				current = word;
			}
			else {
				current = next;
			}
		}
		if (current) chunks.push(current);
		return chunks;
	}

	const chunks: string[] = [];
	let current = '';
	for (const sentence of sentences) {
		const next = current ? `${current} ${sentence}` : sentence;
		if (next.length > maxLength && current) {
			chunks.push(current);
			current = sentence;
		}
		else if (sentence.length > maxLength) {
			chunks.push(...splitLongText(sentence, maxLength));
			current = '';
		}
		else {
			current = next;
		}
	}
	if (current) chunks.push(current);
	return chunks;
}

function chunkSectionText(parts: string[]) {
	const chunks: string[] = [];
	let current = '';

	for (const part of parts.map(normalizeText).filter(Boolean)) {
		if (!part) continue;
		if (part.length > MAX_CHUNK_SIZE) {
			for (const split of splitLongText(part, MAX_CHUNK_SIZE)) {
				if (current) {
					chunks.push(current);
					current = '';
				}
				chunks.push(split);
			}
			continue;
		}

		const next = current ? `${current}\n\n${part}` : part;
		if (next.length > MAX_CHUNK_SIZE && current) {
			chunks.push(current);
			const overlap = current.slice(-CHUNK_OVERLAP).trim();
			current = overlap ? `${overlap}\n\n${part}` : part;
			if (current.length > MAX_CHUNK_SIZE) {
				chunks.push(...splitLongText(current, MAX_CHUNK_SIZE));
				current = '';
			}
		}
		else {
			current = next;
		}
	}

	if (current) chunks.push(current);
	return chunks;
}

function buildSectionHierarchy(sectionLabel: string, title: string, section: MarkdownSection) {
	return [sectionLabel, title, section.h2, section.h3].filter(Boolean) as string[];
}

function createSummaryChunk(routePath: string, title: string, description: string | undefined, sectionLabel: string, sections: MarkdownSection[]): RawChunk | null {
	const firstSection = sections[0];
	const summaryParts = [description];

	if (firstSection?.h2 && !firstSection.h3) summaryParts.push(firstSection.h2);
	if (firstSection?.textParts[0]) summaryParts.push(firstSection.textParts[0]);
	if (!summaryParts.some(Boolean)) return null;

	const content = normalizeText(summaryParts.filter(Boolean).join('\n\n'));
	if (!content) return null;

	return {
		url: toSearchUrl(routePath),
		hierarchy: [sectionLabel, title],
		content,
		code_blocks: firstSection?.codeBlocks.length ? [...new Set(firstSection.codeBlocks)] : undefined,
		weight: 10,
		level: 0,
		position: 0,
	};
}

export function chunkMarkdownPage({ sourcePath, updatedAt, partials }: ChunkMarkdownPageOptions): IndexedSearchDocument[] {
	const fileSource = fs.readFileSync(sourcePath, 'utf8');
	const parsed = matter(fileSource, { engines: { yaml: value => loadYaml(value, YAML_OPTIONS) as Record<string, unknown> } });
	const frontmatter = parsed.data as MarkdownFrontmatter;
	const routePath = contentPathToPublicPath(path.relative(process.cwd(), sourcePath).replace(/\\/g, '/'));
	const section = findSectionByPath(routePath)?.id ?? 'getting-started';
	const sectionLabel = findSectionByPath(routePath)?.label ?? 'Get Started';
	const title = frontmatter.title?.trim();
	if (!title) {
		throw new Error(`Missing title in ${sourcePath}`);
	}

	const pageSearchTitle = buildPageSearchTitle(routePath, title);
	const pathDepth = getPathDepth(routePath);
	const tree = remark().use(remarkParse).use(remarkMdc).parse(parsed.content) as { children: MdastNode[] };
	const blocks = extractBlocks(tree.children, partials);
	const sections = blocksToSections(blocks);
	const sectionAnchors = buildSectionAnchors(sections);
	const rawChunks: RawChunk[] = [];
	const summaryChunk = createSummaryChunk(routePath, pageSearchTitle, frontmatter.description, sectionLabel, sections);
	if (summaryChunk) rawChunks.push(summaryChunk);

	for (const [sectionIndex, sectionBlock] of sections.entries()) {
		const textParts = sectionBlock.textParts.length > 0
			? sectionBlock.textParts
			: [sectionBlock.h3 ?? sectionBlock.h2 ?? title];
		const contentChunks = chunkSectionText(textParts);
		const anchor = sectionAnchors[sectionIndex];
		const heading = sectionBlock.h3 ?? sectionBlock.h2;
		const hierarchy = buildSectionHierarchy(sectionLabel, pageSearchTitle, sectionBlock);
		const codeBlocks = [...new Set(sectionBlock.codeBlocks.map(normalizeCode).filter(Boolean))];
		const level = sectionBlock.h3 ? 2 : sectionBlock.h2 ? 1 : 0;

		for (const [index, content] of contentChunks.entries()) {
			rawChunks.push({
				url: toSearchUrl(routePath, anchor),
				anchor,
				heading,
				hierarchy,
				content,
				code_blocks: codeBlocks.length ? codeBlocks : undefined,
				weight: heading ? (index === 0 ? 8 : 5) : (index === 0 ? 10 : 5),
				level,
				position: (sectionIndex * 10) + index + 1,
			});
		}
	}

	const groupId = toSearchUrl(routePath);
	const totalChunks = rawChunks.length;
	return rawChunks.map((chunk, chunkIndex) => ({
		id: `${chunk.url}#${chunkIndex}`,
		group_id: groupId,
		chunk_index: chunkIndex,
		total_chunks: totalChunks,
		url: chunk.url,
		title,
		search_title: buildChunkSearchTitle(pageSearchTitle, chunk.heading),
		description: frontmatter.description?.trim() || undefined,
		anchor: chunk.anchor,
		heading: chunk.heading,
		hierarchy: chunk.hierarchy,
		path_tokens: buildPathTokens(routePath, chunk.anchor),
		path_depth: pathDepth,
		rank_order: buildRankOrder(routePath, chunk.level, chunk.position),
		section,
		doc_type: 'page',
		technologies: Array.isArray(frontmatter.technologies) && frontmatter.technologies.length > 0
			? frontmatter.technologies
			: undefined,
		content: chunk.content,
		code_blocks: chunk.code_blocks,
		weight: chunk.weight,
		updated_at: updatedAt,
		_source_path: path.relative(process.cwd(), sourcePath).replace(/\\/g, '/'),
	}));
}

export function collectMarkdownDocuments() {
	const partials = loadPartials();
	const files = listRoutableContentFiles('content').filter(file => {
		if (file.startsWith('content/_partials/')) return false;
		return true;
	});

	const documents: IndexedSearchDocument[] = [];
	const failures: Array<{ file: string; error: string }> = [];
	for (const file of files) {
		const sourcePath = path.resolve(file);
		const stat = fs.statSync(sourcePath);
		try {
			documents.push(...chunkMarkdownPage({
				sourcePath,
				updatedAt: Math.round(stat.mtimeMs),
				partials,
			}));
		}
		catch (error) {
			failures.push({
				file,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	return { documents, filesIndexed: files.length, failures };
}
