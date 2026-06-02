import { describe, expect, it } from 'vitest';
import { abuseGate } from './abuse-gate';

const trusted = {
	origin: 'http://localhost:3000',
	referer: 'http://localhost:3000/docs',
	secFetchSite: 'same-origin',
	secFetchMode: 'cors',
	secFetchDest: 'empty',
	userAgent: 'Mozilla/5.0 Chrome/120 Safari/537.36',
	acceptLanguage: 'en-US',
	host: 'localhost:3000',
	nodeEnv: 'development',
};

describe('abuseGate', () => {
	it('trusts browser requests from localhost in dev', () => {
		expect(abuseGate(trusted).verdict).toBe('trusted');
	});

	it('blocks missing origin and referer', () => {
		expect(abuseGate({ ...trusted, origin: undefined, referer: undefined }).verdict).toBe('blocked');
	});

	it('degrades valid origin with missing fetch headers', () => {
		expect(abuseGate({ ...trusted, secFetchSite: undefined }).verdict).toBe('suspicious');
	});

	it('does not allow arbitrary vercel apps in production', () => {
		expect(abuseGate({
			...trusted,
			origin: 'https://evil.vercel.app',
			referer: 'https://evil.vercel.app/docs',
			vercelEnv: 'production',
			nodeEnv: 'production',
		}).verdict).toBe('blocked');
	});

	it('allows the Directus docs production origin', () => {
		expect(abuseGate({
			...trusted,
			origin: 'https://directus.com',
			referer: 'https://directus.com/docs',
			host: 'directus.com',
			vercelEnv: 'production',
			nodeEnv: 'production',
		}).verdict).toBe('trusted');
	});

	it('allows exact Vercel preview URL in preview', () => {
		expect(abuseGate({
			...trusted,
			origin: 'https://directus-docs-git-branch.vercel.app',
			referer: 'https://directus-docs-git-branch.vercel.app/docs',
			vercelEnv: 'preview',
			vercelUrl: 'directus-docs-git-branch.vercel.app',
			nodeEnv: 'production',
		}).verdict).toBe('trusted');
	});

	it('allows Directus Vercel branch aliases in preview', () => {
		expect(abuseGate({
			...trusted,
			origin: 'https://docs-git-bry-dockem-8-ai-assistant-directus.vercel.app',
			referer: 'https://docs-git-bry-dockem-8-ai-assistant-directus.vercel.app/docs',
			host: 'docs-git-bry-dockem-8-ai-assistant-directus.vercel.app',
			vercelEnv: 'preview',
			vercelUrl: 'docs-abc123-directus.vercel.app',
			nodeEnv: 'production',
		}).verdict).toBe('trusted');
	});

	it('does not allow arbitrary Vercel branch aliases in preview', () => {
		expect(abuseGate({
			...trusted,
			origin: 'https://evil-git-branch-someone.vercel.app',
			referer: 'https://evil-git-branch-someone.vercel.app/docs',
			host: 'evil-git-branch-someone.vercel.app',
			vercelEnv: 'preview',
			vercelUrl: 'docs-abc123-directus.vercel.app',
			nodeEnv: 'production',
		}).verdict).toBe('blocked');
	});
});
