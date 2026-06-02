import { getHeader, getRequestIP, readRawBody, setResponseHeader, setResponseStatus, type H3Event } from 'h3';
import { safeValidateUIMessages, type UIMessage } from 'ai';
import { abuseGateFromEvent, type GateVerdict } from './abuse-gate';
import { fingerprintFromEvent } from './fingerprint';
import { checkAssistantDailyLimits, ipPrefix } from './rate-limit';
import type { AssistantMode } from './profiles';
import { boundRawMessages, redactValue } from './sanitize';
import { checkRateLimit } from '~~/server/utils/rate-limit';
import { captureServerPostHog } from '~~/modules/posthog/runtime/server/capture';

const MAX_BODY_BYTES = 512 * 1024;

export type AssistantAdmitContext = {
	requestId: string;
	ip: string;
	ipPrefix: string;
	fingerprint: string;
	fingerprintEntropy: 'high' | 'low';
	posthogDistinctId: string;
	gateVerdict: GateVerdict;
	mode: AssistantMode;
	rateLimitHit?: string;
	resetAt?: string;
	remainingDay?: number;
};

// Result of the admission sequence. `ok: true` carries the validated request;
// `ok: false` carries the JSON body already written to the response via rejectJson.
export type AdmittedRequest = { ok: true; ctx: AssistantAdmitContext; messages: UIMessage[] };
export type Denied = { ok: false; body: ReturnType<typeof rejectJson> };

function requestId(): string {
	return `req_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export type AssistantErrorCode = 'BLOCKED' | 'RATE_LIMIT_BURST' | 'RATE_LIMIT_DAILY' | 'PAYLOAD_TOO_LARGE' | 'BAD_JSON' | 'INVALID_MESSAGES' | 'KILL_SWITCH' | 'UPSTREAM_QUOTA' | 'NOT_CONFIGURED';

function errorBody(code: AssistantErrorCode, message: string, requestIdValue: string, extra: Record<string, unknown> = {}) {
	return { code, message, requestId: requestIdValue, ...extra };
}

function rejectJson(event: H3Event, statusCode: number, code: AssistantErrorCode, message: string, ctx: Partial<AssistantAdmitContext>, extra: Record<string, unknown> = {}) {
	setResponseStatus(event, statusCode);
	setResponseHeader(event, 'Content-Type', 'application/json');
	if (ctx.requestId) setResponseHeader(event, 'X-Request-ID', ctx.requestId);
	if (typeof extra.retryAfter === 'number') setResponseHeader(event, 'Retry-After', extra.retryAfter);

	captureServerPostHog(event, 'assistant_rejected', ctx.posthogDistinctId || ctx.fingerprint || 'unknown', redactValue({
		reason: code,
		request_id: ctx.requestId,
		ip_prefix: ctx.ipPrefix,
		fingerprint: ctx.fingerprint,
		fingerprint_entropy: ctx.fingerprintEntropy,
		mode: ctx.mode,
		gate_verdict: ctx.gateVerdict,
		rate_limit_hit: ctx.rateLimitHit,
	}) as Record<string, unknown>);

	console.warn('[assistant] rejected', { code, requestId: ctx.requestId, ipPrefix: ctx.ipPrefix, gate: ctx.gateVerdict, rateLimitHit: ctx.rateLimitHit });
	return errorBody(code, message, ctx.requestId || 'unknown', extra);
}

function deny(event: H3Event, statusCode: number, code: AssistantErrorCode, message: string, ctx: Partial<AssistantAdmitContext>, extra: Record<string, unknown> = {}): Denied {
	return { ok: false, body: rejectJson(event, statusCode, code, message, ctx, extra) };
}

// Gate + burst limit. Cheap identity/abuse checks before we spend a daily quota.
async function checkGateAndBurst(event: H3Event): Promise<AssistantAdmitContext | Denied> {
	const id = requestId();
	setResponseHeader(event, 'X-Request-ID', id);

	if (process.env.ASSISTANT_ENABLED === 'false') {
		return deny(event, 503, 'KILL_SWITCH', 'Assistant is temporarily unavailable.', { requestId: id });
	}

	const fp = fingerprintFromEvent(event);
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	const prefix = ipPrefix(ip);
	const ctx: AssistantAdmitContext = {
		requestId: id,
		ip,
		ipPrefix: prefix,
		fingerprint: fp.fingerprint,
		fingerprintEntropy: fp.entropy,
		posthogDistinctId: fp.posthogDistinctId,
		gateVerdict: 'blocked',
		mode: 'normal',
	};

	const gate = abuseGateFromEvent(event);
	ctx.gateVerdict = gate.verdict;
	if (gate.verdict === 'blocked') {
		return deny(event, 403, 'BLOCKED', 'Chat unavailable from this browser context. Try refreshing the page.', ctx);
	}

	const burstWindow = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
	const burst = await checkRateLimit(`assistant:burst:${ip}`, { max: 10, windowSeconds: Math.ceil(burstWindow / 1000), onStoreError: 'deny' });
	if (!burst.ok) {
		ctx.rateLimitHit = 'burst';
		return deny(event, 429, 'RATE_LIMIT_BURST', `Slow down — too many messages. Try again in ${burst.retryAfter}s.`, ctx, { retryAfter: burst.retryAfter });
	}

	ctx.mode = gate.verdict === 'suspicious' || fp.entropy === 'low' ? 'degraded' : 'normal';
	setResponseHeader(event, 'X-Assistant-Mode', ctx.mode);
	return ctx;
}

// Body size / JSON / message bounding / UIMessage validation. Runs before the
// daily limit so a malformed request never consumes a user's daily quota.
async function parseBody(event: H3Event, ctx: AssistantAdmitContext): Promise<UIMessage[] | Denied> {
	const contentLength = Number(getHeader(event, 'content-length') || 0);
	if (contentLength > MAX_BODY_BYTES) {
		return deny(event, 413, 'PAYLOAD_TOO_LARGE', 'Message is too large. Shorten your request and try again.', ctx);
	}

	const raw = await readRawBody(event);
	if (!raw || Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
		return deny(event, 413, 'PAYLOAD_TOO_LARGE', 'Message is too large. Shorten your request and try again.', ctx);
	}

	let body: unknown;
	try {
		body = JSON.parse(raw);
	}
	catch {
		return deny(event, 400, 'BAD_JSON', 'Invalid request body.', ctx);
	}

	const bounded = boundRawMessages((body as { messages?: unknown })?.messages);
	if (bounded.error) {
		return deny(event, 400, 'INVALID_MESSAGES', bounded.error, ctx);
	}

	const validated = await safeValidateUIMessages({ messages: bounded.messages });
	if (!validated.success) {
		return deny(event, 400, 'INVALID_MESSAGES', validated.error?.message || 'Invalid messages.', ctx);
	}

	return validated.data;
}

// Per-UTC-day limit. Last gate, because it is the scarcest quota.
async function enforceDailyLimits(event: H3Event, ctx: AssistantAdmitContext): Promise<AssistantAdmitContext | Denied> {
	const daily = await checkAssistantDailyLimits({
		ip: ctx.ip,
		fingerprint: ctx.fingerprint,
		fingerprintEntropy: ctx.fingerprintEntropy,
		ipPrefix: ctx.ipPrefix,
	});
	ctx.resetAt = daily.resetAt;
	ctx.remainingDay = daily.remainingExactIp;
	if (!daily.ok) {
		ctx.rateLimitHit = daily.reason;
		return deny(event, 429, 'RATE_LIMIT_DAILY', 'Daily limit reached. Resets at midnight UTC. If you are a real user hitting this often, email docs@directus.io.', ctx, {
			retryAfter: daily.retryAfter,
			resetAt: daily.resetAt,
		});
	}

	if (daily.mode === 'degraded') ctx.mode = 'degraded';
	setResponseHeader(event, 'X-Assistant-Mode', ctx.mode);
	setResponseHeader(event, 'X-RateLimit-Remaining-Day', String(ctx.remainingDay));
	return ctx;
}

// The whole admission sequence in one place. Order is load-bearing:
//   gate → burst → parse → daily
// Cheap abuse/identity checks first; body validation before the daily quota so
// garbage requests never burn a user's daily allowance. This ordering is the
// real bug surface — see admit.test.ts.
export async function admitChat(event: H3Event): Promise<AdmittedRequest | Denied> {
	const gated = await checkGateAndBurst(event);
	if ('ok' in gated) return gated;

	const parsed = await parseBody(event, gated);
	if (!Array.isArray(parsed)) return parsed;

	const limited = await enforceDailyLimits(event, gated);
	if ('ok' in limited) return limited;

	return { ok: true, ctx: limited, messages: parsed };
}
