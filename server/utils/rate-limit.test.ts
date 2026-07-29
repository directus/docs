import { describe, expect, it, vi } from 'vitest';
import { checkRateLimit, type RateLimitStore } from './rate-limit';

function storeReturning(count: number): RateLimitStore {
	return { incr: vi.fn(async () => count) };
}

describe('checkRateLimit', () => {
	it('allows requests within the policy max', async () => {
		const result = await checkRateLimit('key', { max: 2, windowSeconds: 60, onStoreError: 'deny' }, storeReturning(2));
		expect(result).toEqual({ ok: true });
	});

	it('returns the full fixed window as retryAfter when rejected', async () => {
		const result = await checkRateLimit('key', { max: 2, windowSeconds: 60, onStoreError: 'deny' }, storeReturning(3));
		expect(result).toEqual({ ok: false, retryAfter: 60 });
	});

	it('fails closed when configured to deny store errors', async () => {
		const store = { incr: vi.fn(async () => { throw new Error('down'); }) };
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await checkRateLimit('key', { max: 2, windowSeconds: 60, onStoreError: 'deny' }, store);

		expect(result).toEqual({ ok: false, retryAfter: 60 });
		errorSpy.mockRestore();
	});

	it('fails open when configured to allow store errors', async () => {
		const store = { incr: vi.fn(async () => { throw new Error('down'); }) };
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await checkRateLimit('key', { max: 2, windowSeconds: 60, onStoreError: 'allow' }, store);

		expect(result).toEqual({ ok: true });
		errorSpy.mockRestore();
	});
});
