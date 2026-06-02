import { describe, expect, it } from 'vitest';
import type { Client } from 'typesense';
import { aliasFromSlot, cleanupAlias, parseArgs } from '../../scripts/cleanup-typesense-preview';

describe('cleanup Typesense preview indexes', () => {
	it('parses targeted branch cleanup args', () => {
		expect(parseArgs(['--branch', 'bry/foo'], {})).toEqual({
			branch: 'bry/foo',
			stale: false,
			dryRun: false,
		});
	});

	it('parses stale dry-run cleanup args and env defaults', () => {
		expect(parseArgs(['--stale'], { TYPESENSE_CLEANUP_DRY_RUN: 'true' })).toEqual({
			stale: true,
			dryRun: true,
		});

		expect(parseArgs([], { TYPESENSE_PREVIEW_BRANCH: 'bry/foo' })).toEqual({
			branch: 'bry/foo',
			stale: false,
			dryRun: false,
		});
	});

	it('rejects ambiguous or unknown cleanup args', () => {
		expect(() => parseArgs(['--branch', 'bry/foo', '--stale'], {})).toThrow('Use either --branch or --stale');
		expect(() => parseArgs(['--branch', '--dry-run'], {})).toThrow('--branch requires a branch name');
		expect(() => parseArgs(['--wat'], {})).toThrow('Unknown argument');
		expect(() => parseArgs([], {})).toThrow('Set --branch <branch> or --stale');
	});

	it('derives preview alias names from fixed slots', () => {
		expect(aliasFromSlot('directus-docs-preview-bry-foo-a')).toBe('directus-docs-preview-bry-foo');
		expect(aliasFromSlot('directus-docs-preview-bry-foo-b')).toBe('directus-docs-preview-bry-foo');
		expect(aliasFromSlot('directus-docs-a')).toBeNull();
		expect(aliasFromSlot('directus-docs-preview-bry-foo')).toBeNull();
	});

	it('refuses to clean non-preview aliases', async () => {
		await expect(cleanupAlias({} as Client, 'directus-docs', true)).rejects.toThrow(
			'Refusing to clean non-preview alias: directus-docs',
		);
	});
});
