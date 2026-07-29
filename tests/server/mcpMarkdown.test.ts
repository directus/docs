import { describe, expect, it } from 'vitest';
import { normalizeDocPath, parseMcpMarkdown } from '../../server/utils/mcpMarkdown';
import { getMcpMarkdownPath } from '../../server/utils/mcpStatic';

describe('mcpMarkdown', () => {
	it('normalizes doc paths', () => {
		expect(normalizeDocPath('self-hosting/requirements')).toBe('/self-hosting/requirements');
		expect(normalizeDocPath('/self-hosting/requirements')).toBe('/self-hosting/requirements');
	});

	it('maps root docs path to index markdown', () => {
		expect(getMcpMarkdownPath('/')).toBe('/index');
		expect(getMcpMarkdownPath('/self-hosting/requirements')).toBe('/self-hosting/requirements');
	});

	it('parses frontmatter and markdown body', () => {
		const page = parseMcpMarkdown(`---
title: Self-Hosting Requirements
description: This page outlines the requirements.
---

# Ignored title

Body
`, '/self-hosting/requirements');

		expect(page).toEqual({
			title: 'Self-Hosting Requirements',
			description: 'This page outlines the requirements.',
			content: '# Ignored title\n\nBody\n',
		});
	});

	it('falls back to markdown title', () => {
		const page = parseMcpMarkdown('# Page title\n\nBody\n', '/fallback');

		expect(page.title).toBe('Page title');
		expect(page.description).toBe('');
		expect(page.content).toBe('# Page title\n\nBody\n');
	});
});
