// @vitest-environment node

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { chunkMarkdownPage, loadPartials } from '../../scripts/index-docs-chunker.ts';

describe('index-docs chunker', () => {
	it('keeps MDC-heavy home page chunks clean', () => {
		const sourcePath = path.resolve('content/index.md');
		const partials = loadPartials();
		const documents = chunkMarkdownPage({
			sourcePath,
			updatedAt: Math.round(fs.statSync(sourcePath).mtimeMs),
			partials,
		});

		const combined = documents.map(document => document.content).join('\n');
		expect(combined).toContain('Local Demo');
		expect(combined).toContain('Try Directus locally in one command.');
		expect(combined).not.toContain('shiny-card');
		expect(combined).not.toContain('shiny-grid');
		expect(combined).not.toContain('two-up');
	});

	it('extracts card titles from component-only sections', () => {
		const sourcePath = path.resolve('content/guides/09.extensions/2.api-extensions/0.index.md');
		const partials = loadPartials();
		const documents = chunkMarkdownPage({
			sourcePath,
			updatedAt: Math.round(fs.statSync(sourcePath).mtimeMs),
			partials,
		});

		const combined = documents.map(document => document.content).join('\n');
		expect(combined).toContain('Hooks');
		expect(combined).toContain('Endpoints');
		expect(combined).toContain('Operations');
		expect(combined).not.toContain('shiny-card');
	});

	it('matches rendered heading anchors for duplicate and punctuated headings', () => {
		const sourcePath = path.resolve('content/guides/06.flows/4.operations.md');
		const partials = loadPartials();
		const documents = chunkMarkdownPage({
			sourcePath,
			updatedAt: Math.round(fs.statSync(sourcePath).mtimeMs),
			partials,
		});

		const optionsAnchors = [...new Set(documents
			.filter(document => document.heading === 'Options')
			.map(document => document.anchor))];

		expect(optionsAnchors.slice(0, 4)).toEqual(['options', 'options-1', 'options-2', 'options-3']);
		expect(optionsAnchors).toHaveLength(new Set(optionsAnchors).size);
		expect(documents.find(document => document.heading === 'Webhook / Request URL')?.anchor).toBe('webhook--request-url');
	});
});
