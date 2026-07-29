// The public docs API rate limit, stated once.
//
// Three docs endpoints (get, index, search) share the same per-IP limit and
// the same fail-open decision from ADR-0001: these are cheap public reads, so
// an Upstash blip must not take down docs search. This wraps the shared
// checkRateLimit limiter with the docs-API key and policy; it does not
// reimplement the algorithm.

import { createError, getRequestIP, setResponseHeader, type H3Event } from 'h3';
import { checkRateLimit, type RateLimitStore } from './rate-limit';

const DOCS_API_POLICY = { max: 60, windowSeconds: 60, onStoreError: 'allow' } as const;

// Enforce the public docs API limit for this request. Resolves when the request
// is within the limit; throws a 429 (with Retry-After) when it is over.
// `store` is for tests — production uses the shared default store.
export async function enforceDocsApiLimit(event: H3Event, store?: RateLimitStore): Promise<void> {
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	const verdict = await checkRateLimit(`docs-api:${ip}`, DOCS_API_POLICY, store);
	if (!verdict.ok) {
		setResponseHeader(event, 'Retry-After', verdict.retryAfter ?? 60);
		throw createError({ statusCode: 429, message: 'Rate limit exceeded' });
	}
}
