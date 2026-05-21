import type { H3Event } from 'h3';
import { abuseGateFromEvent, type GateVerdict } from './abuse-gate';
import { fingerprintFromEvent } from './fingerprint';
import { checkAssistantDailyLimits, checkRateLimit, ipPrefix } from './rate-limit';
import type { AssistantMode } from './profiles';
import { captureServerPostHog } from '~~/modules/posthog/runtime/server/capture';
import { redactValue } from './sanitize';

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

export function requestId(): string {
	return `req_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export type AssistantErrorCode = 'BLOCKED' | 'RATE_LIMIT_BURST' | 'RATE_LIMIT_DAILY' | 'PAYLOAD_TOO_LARGE' | 'BAD_JSON' | 'INVALID_MESSAGES' | 'KILL_SWITCH' | 'UPSTREAM_QUOTA' | 'NOT_CONFIGURED';

export function errorBody(code: AssistantErrorCode, message: string, requestIdValue: string, extra: Record<string, unknown> = {}) {
	return { code, message, requestId: requestIdValue, ...extra };
}

export function rejectJson(event: H3Event, statusCode: number, code: AssistantErrorCode, message: string, ctx: Partial<AssistantAdmitContext>, extra: Record<string, unknown> = {}) {
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

export async function assertAdmissible(event: H3Event): Promise<AssistantAdmitContext | ReturnType<typeof rejectJson>> {
	const id = requestId();
	setResponseHeader(event, 'X-Request-ID', id);

	const fp = fingerprintFromEvent(event);
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	const prefix = ipPrefix(ip);
	const baseCtx: AssistantAdmitContext = {
		requestId: id,
		ip,
		ipPrefix: prefix,
		fingerprint: fp.fingerprint,
		fingerprintEntropy: fp.entropy,
		posthogDistinctId: fp.posthogDistinctId,
		gateVerdict: 'blocked',
		mode: 'normal',
	};

	if (process.env.ASSISTANT_ENABLED === 'false') {
		return rejectJson(event, 503, 'KILL_SWITCH', 'Assistant is temporarily unavailable.', baseCtx);
	}

	const gate = abuseGateFromEvent(event);
	baseCtx.gateVerdict = gate.verdict;
	if (gate.verdict === 'blocked') {
		return rejectJson(event, 403, 'BLOCKED', 'Chat unavailable from this browser context. Try refreshing the page.', baseCtx);
	}

	const burstWindow = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
	const burst = checkRateLimit(`assistant:burst:${ip}`, 10, burstWindow);
	if (!burst.ok) {
		baseCtx.rateLimitHit = 'burst';
		return rejectJson(event, 429, 'RATE_LIMIT_BURST', `Slow down — too many messages. Try again in ${burst.retryAfter}s.`, baseCtx, { retryAfter: burst.retryAfter });
	}

	baseCtx.mode = gate.verdict === 'suspicious' || fp.entropy === 'low' ? 'degraded' : 'normal';
	setResponseHeader(event, 'X-Assistant-Mode', baseCtx.mode);
	return baseCtx;
}

export async function enforceDailyLimits(event: H3Event, ctx: AssistantAdmitContext): Promise<AssistantAdmitContext | ReturnType<typeof rejectJson>> {
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
		return rejectJson(event, 429, 'RATE_LIMIT_DAILY', 'Daily limit reached. Resets at midnight UTC. If you are a real user hitting this often, email docs@directus.io.', ctx, {
			retryAfter: daily.retryAfter,
			resetAt: daily.resetAt,
		});
	}

	if (daily.mode === 'degraded') ctx.mode = 'degraded';
	setResponseHeader(event, 'X-Assistant-Mode', ctx.mode);
	setResponseHeader(event, 'X-RateLimit-Remaining-Day', String(ctx.remainingDay));
	return ctx;
}

export function isAdmitContext(value: AssistantAdmitContext | Record<string, unknown>): value is AssistantAdmitContext {
	return typeof (value as AssistantAdmitContext).requestId === 'string' && typeof (value as AssistantAdmitContext).posthogDistinctId === 'string';
}
