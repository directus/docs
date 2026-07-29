import { Readable } from 'node:stream';
import { createEvent, type H3Event } from 'h3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UIMessage } from 'ai';
import { buildRequestContext } from './request-context';
import { PROFILES } from './profiles';

// queryCollection is the only I/O dependency: it verifies a page path exists.
// Default to "page exists"; individual tests override to simulate unknown pages.
const mockFirst = vi.fn(async () => ({ path: '/docs/getting-started' }));
vi.mock('@nuxt/content/server', () => ({
	queryCollection: () => ({
		where: () => ({ first: mockFirst }),
	}),
}));

function buildEvent(headers: Record<string, string> = {}): H3Event {
	const req = Readable.from([]) as unknown as import('node:http').IncomingMessage;
	req.method = 'POST';
	req.url = '/api/chat';
	req.headers = headers;
	(req as { socket: unknown }).socket = { remoteAddress: '127.0.0.1' };

	const res = {
		statusCode: 200,
		setHeader() {},
		getHeader() {},
		headersSent: false,
	} as unknown as import('node:http').ServerResponse;

	return createEvent(req, res);
}

function textMessage(id: string, text: string): UIMessage {
	return { id, role: 'user', parts: [{ type: 'text', text }] } as UIMessage;
}

function prefsCookie(prefs: Record<string, string>): Record<string, string> {
	return { cookie: `directus-docs-prefs=${encodeURIComponent(JSON.stringify(prefs))}` };
}

const BASE = {
	baseURL: '/docs',
	basePrompt: 'SYSTEM',
	requestId: 'req_test',
	profile: PROFILES.normal,
};

beforeEach(() => {
	mockFirst.mockReset();
	mockFirst.mockResolvedValue({ path: '/getting-started' });
});

describe('buildRequestContext', () => {
	it('returns null page path and bare prompt when nothing is supplied', async () => {
		const ctx = await buildRequestContext({ ...BASE, event: buildEvent(), messages: [] });
		expect(ctx.pagePath).toBeNull();
		expect(ctx.prefs).toBeNull();
		expect(ctx.sessionId).toBeUndefined();
		expect(ctx.framework).toBe('');
		expect(ctx.systemPrompt).toBe('SYSTEM');
	});

	it('resolves a known page path and prepends it to the prompt', async () => {
		const ctx = await buildRequestContext({
			...BASE,
			event: buildEvent({ 'x-page-path': '/docs/getting-started' }),
			messages: [],
		});
		expect(ctx.pagePath).toBe('/getting-started');
		expect(ctx.systemPrompt).toBe('Current page: /getting-started\n\nSYSTEM');
	});

	it('drops a page path the content collection does not know', async () => {
		mockFirst.mockResolvedValue(null);
		const ctx = await buildRequestContext({
			...BASE,
			event: buildEvent({ 'x-page-path': '/docs/nope' }),
			messages: [],
		});
		expect(ctx.pagePath).toBeNull();
		expect(ctx.systemPrompt).toBe('SYSTEM');
	});

	it('sanitizes prefs, exposes framework, and renders them as user context', async () => {
		const ctx = await buildRequestContext({
			...BASE,
			event: buildEvent(prefsCookie({ framework: 'Vue', role: 'Developer', junk: 'xy!@#$' })),
			messages: [],
		});
		expect(ctx.framework).toBe('Vue');
		expect(ctx.prefs).toMatchObject({ framework: 'Vue', role: 'Developer' });
		expect(ctx.systemPrompt).toContain('User context:');
		expect(ctx.systemPrompt).toContain('- Preferred framework: Vue');
		expect(ctx.systemPrompt).toContain('- Role: Developer');
	});

	it('ignores a malformed prefs cookie', async () => {
		const ctx = await buildRequestContext({
			...BASE,
			event: buildEvent({ cookie: 'directus-docs-prefs=not-json' }),
			messages: [],
		});
		expect(ctx.prefs).toBeNull();
		expect(ctx.framework).toBe('');
	});

	it('accepts a valid session id and rejects an invalid one', async () => {
		const ok = await buildRequestContext({
			...BASE,
			event: buildEvent({ 'x-assistant-session-id': 'sess_ABC-123' }),
			messages: [],
		});
		expect(ok.sessionId).toBe('sess_ABC-123');

		const bad = await buildRequestContext({
			...BASE,
			event: buildEvent({ 'x-assistant-session-id': 'has spaces!' }),
			messages: [],
		});
		expect(bad.sessionId).toBeUndefined();
	});

	it('compacts to the profile message limit and strips non-text parts', async () => {
		const messages: UIMessage[] = [
			...Array.from({ length: 15 }, (_, i) => textMessage(`m${i}`, `msg ${i}`)),
			{ id: 'tool', role: 'assistant', parts: [{ type: 'tool-foo' } as never] } as UIMessage,
		];
		const ctx = await buildRequestContext({
			...BASE,
			profile: PROFILES.normal,
			event: buildEvent(),
			messages,
		});
		// normal.messageLimit is 12; the tool-only message has no text parts and drops out.
		expect(ctx.messages.length).toBeLessThanOrEqual(PROFILES.normal.messageLimit);
		expect(ctx.messages.every(m => m.parts.length > 0)).toBe(true);
		expect(ctx.messages.every(m => m.parts.every(p => p.type === 'text'))).toBe(true);
	});
});
