import { describe, expect, it } from 'vitest';
import { sliceUtf8 } from '../../server/utils/sliceUtf8';

describe('sliceUtf8', () => {
	it('backs up to a valid UTF-8 boundary', () => {
		const first = sliceUtf8('abc😀def', 0, 5);

		expect(first.content).toBe('abc');
		expect(first.nextOffset).toBe(3);
		expect(first.truncated).toBe(true);

		const second = sliceUtf8('abc😀def', first.nextOffset!, 1024);

		expect(second.content).toBe('😀def');
		expect(second.nextOffset).toBeNull();
		expect(second.truncated).toBe(false);
	});
});
