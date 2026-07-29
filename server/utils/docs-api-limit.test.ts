import { createEvent, type H3Event } from 'h3';
import { describe, expect, it, vi } from 'vitest';
import { enforceDocsApiLimit } from './docs-api-limit';
import type { RateLimitStore } from './rate-limit';

function storeReturning(count: number): RateLimitStore {
	return { incr: vi.fn(async () => count) };
}

function buildEvent(): { event: H3Event; headers: Record<string, string | number> } {
	const headers: Record<string, string | number> = {};
	const req = {
		method: 'GET',
		url: '/api/docs/search',
		headers: { 'x-forwarded-for': '203.0.113.7' },
		socket: { remoteAddress: '203.0.113.7' },
	} as unknown as import('node:http').IncomingMessage;

	const res = {
		statusCode: 200,
		setHeader(name: string, value: string | number) {
			headers[name] = value;
		},
		getHeader() {},
		headersSent: false,
	} as unknown as import('node:http').ServerResponse;

	return { event: createEvent(req, res), headers };
}

describe('enforceDocsApiLimit', () => {
	it('resolves when the request is within the limit', async () => {
		const { event } = buildEvent();
		await expect(enforceDocsApiLimit(event, storeReturning(60))).resolves.toBeUndefined();
	});

	it('throws a 429 with Retry-After when over the limit', async () => {
		const { event, headers } = buildEvent();
		await expect(enforceDocsApiLimit(event, storeReturning(61))).rejects.toMatchObject({ statusCode: 429 });
		expect(headers['Retry-After']).toBe(60);
	});

	it('fails open when the store errors (public reads must survive an Upstash blip)', async () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const store: RateLimitStore = { incr: vi.fn(async () => {
			throw new Error('down');
		}) };

		const { event } = buildEvent();
		await expect(enforceDocsApiLimit(event, store)).resolves.toBeUndefined();

		errorSpy.mockRestore();
	});
});
