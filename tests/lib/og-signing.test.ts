import { describe, expect, it } from 'vitest';
import { signOgImage } from '../../app/utils/og-sign';
import { canonicalPayloadFromEntries } from '../../lib/og-signing.mjs';

describe('og image signing contract', () => {
	const entries = Object.entries({
		v: '1',
		title: 'Directus Docs',
		description: 'Test',
		breadcrumb: 'Guides > Files',
	});

	it('builds the canonical worker payload', () => {
		expect(canonicalPayloadFromEntries('docs', '1', entries)).toBe(
			'v=1\ntemplate=docs\nbreadcrumb=Guides%20%3E%20Files&description=Test&title=Directus%20Docs&v=1',
		);
	});

	it('signs docs image params with a stable HMAC', async () => {
		const { signature } = await signOgImage({
			template: 'docs',
			params: {
				title: 'Directus Docs',
				description: 'Test',
				breadcrumb: 'Guides > Files',
			},
		}, 'secret');

		expect(signature).toBe('33ab86483f278c1779d85bf8ad6e871fa779925dde17018af8a1415bfa9d1223');
	});
});
