import { afterEach, describe, expect, it } from 'vitest';
import { getTypesenseBranchName, resolveBranchTypesenseAlias, slugifyBranch } from '../../lib/typesenseAlias';

const originalEnv = { ...process.env };

afterEach(() => {
	process.env = { ...originalEnv };
});

describe('typesense alias helpers', () => {
	it('slugifies branch names for preview aliases', () => {
		expect(slugifyBranch('bry/Dockem 6: Typesense')).toBe('bry-dockem-6-typesense');
		expect(resolveBranchTypesenseAlias('bry/foo')).toBe('directus-docs-preview-bry-foo');
	});

	it('maps main to the production alias', () => {
		expect(resolveBranchTypesenseAlias('main')).toBe('directus-docs');
	});

	it('uses the Vercel branch env when GitHub env is absent', () => {
		delete process.env.GITHUB_HEAD_REF;
		delete process.env.GITHUB_REF_NAME;
		process.env.VERCEL_GIT_COMMIT_REF = 'preview/search';

		expect(getTypesenseBranchName()).toBe('preview/search');
	});
});
