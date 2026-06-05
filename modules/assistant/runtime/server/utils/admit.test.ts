import { Readable } from 'node:stream';
import { createEvent, type H3Event } from 'h3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { admitChat } from './admit';
import { checkAssistantDailyLimits } from './rate-limit';
import { checkRateLimit } from '~~/server/utils/rate-limit';

vi.mock('~~/modules/posthog/runtime/server/capture', () => ({
	captureServerPostHog: () => {},
}));

vi.mock('~~/server/utils/rate-limit', () => ({
	checkRateLimit: vi.fn(async () => ({ ok: true })),
}));

// Replace only the daily limiter; keep ipPrefix and the rest of the real module.
vi.mock('./rate-limit', async (importOriginal) => {
	const actual = await importOriginal<typeof import('./rate-limit')>();
	return { ...actual, checkAssistantDailyLimits: vi.fn() };
});

const mockedBurst = vi.mocked(checkRateLimit);
const mockedDaily = vi.mocked(checkAssistantDailyLimits);

const ADMITTED_DAILY = {
	ok: true as const,
	mode: 'normal' as const,
	resetAt: '2026-06-01T00:00:00.000Z',
	counts: {},
	remainingExactIp: 29,
};

// A request that passes the abuse gate as `trusted` from localhost dev.
const TRUSTED_HEADERS: Record<string, string> = {
	'origin': 'http://localhost:3000',
	'referer': 'http://localhost:3000/docs',
	'sec-fetch-site': 'same-origin',
	'sec-fetch-mode': 'cors',
	'sec-fetch-dest': 'empty',
	'user-agent': 'Mozilla/5.0 Chrome/120 Safari/537.36',
	'accept-language': 'en-US',
	'host': 'localhost:3000',
	'sec-ch-ua': '"Chromium";v="120"',
};

function buildEvent(body: string, headers: Record<string, string> = {}): H3Event {
	const merged = { ...TRUSTED_HEADERS, ...headers };
	const req = Readable.from([Buffer.from(body)]) as unknown as import('node:http').IncomingMessage;
	req.method = 'POST';
	req.url = '/api/chat';
	req.headers = { 'content-length': String(Buffer.byteLength(body)), ...merged };
	(req as { socket: unknown }).socket = { remoteAddress: '127.0.0.1' };

	const res = {
		statusCode: 200,
		setHeader() {},
		getHeader() {},
		headersSent: false,
	} as unknown as import('node:http').ServerResponse;

	return createEvent(req, res);
}

function validBody(text = 'hello') {
	return JSON.stringify({ messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text }] }] });
}

let savedEnv: NodeJS.ProcessEnv;

beforeEach(() => {
	savedEnv = { ...process.env };
	mockedBurst.mockReset();
	mockedBurst.mockResolvedValue({ ok: true });
	mockedDaily.mockReset();
	mockedDaily.mockResolvedValue(ADMITTED_DAILY);
	process.env.NODE_ENV = 'development';
	delete process.env.ASSISTANT_ENABLED;
});

afterEach(() => {
	process.env = savedEnv;
});

describe('admitChat sequence', () => {
	it('admits a trusted, well-formed request with validated messages', async () => {
		const result = await admitChat(buildEvent(validBody()));
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.messages).toHaveLength(1);
			expect(result.ctx.gateVerdict).toBe('trusted');
		}
	});

	it('blocks before touching the burst limit when the gate rejects', async () => {
		const result = await admitChat(buildEvent(validBody(), { origin: '', referer: '' }));
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.body.code).toBe('BLOCKED');
		expect(mockedBurst).not.toHaveBeenCalled();
	});

	it('rejects burst before parsing the body', async () => {
		mockedBurst.mockResolvedValue({ ok: false, retryAfter: 42 });
		// Body is invalid JSON; if parse ran first this would be BAD_JSON.
		const result = await admitChat(buildEvent('{ not json', {}));
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.body.code).toBe('RATE_LIMIT_BURST');
			expect((result.body as { retryAfter?: number }).retryAfter).toBe(42);
		}
	});

	it('rejects malformed JSON before spending the daily quota', async () => {
		const result = await admitChat(buildEvent('{ not json'));
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.body.code).toBe('BAD_JSON');
		expect(mockedDaily).not.toHaveBeenCalled();
	});

	it('rejects invalid message shapes before the daily quota', async () => {
		const result = await admitChat(buildEvent(JSON.stringify({ messages: 'nope' })));
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.body.code).toBe('INVALID_MESSAGES');
		expect(mockedDaily).not.toHaveBeenCalled();
	});

	it('enforces the daily limit only after gate, burst, and parse pass', async () => {
		mockedDaily.mockResolvedValue({
			ok: false,
			mode: 'degraded',
			reason: 'exact_ip',
			retryAfter: 3600,
			resetAt: '2026-06-01T00:00:00.000Z',
			counts: {},
			remainingExactIp: 0,
		});
		const result = await admitChat(buildEvent(validBody()));
		expect(mockedDaily).toHaveBeenCalledOnce();
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.body.code).toBe('RATE_LIMIT_DAILY');
			expect((result.body as { retryAfter?: number }).retryAfter).toBe(3600);
		}
	});

	it('honors the kill switch before any other check', async () => {
		process.env.ASSISTANT_ENABLED = 'false';
		const result = await admitChat(buildEvent(validBody(), { origin: '', referer: '' }));
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.body.code).toBe('KILL_SWITCH');
		expect(mockedBurst).not.toHaveBeenCalled();
		expect(mockedDaily).not.toHaveBeenCalled();
	});
});
