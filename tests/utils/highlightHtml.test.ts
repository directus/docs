import { describe, expect, it } from 'vitest';
import { sanitizeHighlightHtml } from '../../app/utils/highlightHtml';

describe('sanitizeHighlightHtml', () => {
	it('keeps mark tags and escapes other markup', () => {
		expect(sanitizeHighlightHtml('<mark>Col</mark><img src=x onerror=alert(1)>')).toBe(
			'<mark>Col</mark>&lt;img src=x onerror=alert(1)&gt;',
		);
	});
});
