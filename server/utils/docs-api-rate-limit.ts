// Per-IP rate limit for the public docs HTTP API (60/min). Lower budget than chat
// because these are read-only and cheap, but still protect against scraping abuse.

interface Bucket {
	count: number;
	resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX = 60;
const buckets = new Map<string, Bucket>();
let lastSweep = 0;

export function checkDocsApiRateLimit(key: string): { ok: boolean; retryAfter?: number } {
	const now = Date.now();

	if (now - lastSweep > WINDOW_MS) {
		for (const [k, b] of buckets) {
			if (b.resetAt < now) buckets.delete(k);
		}
		lastSweep = now;
	}

	const bucket = buckets.get(key);
	if (!bucket || bucket.resetAt < now) {
		buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
		return { ok: true };
	}

	bucket.count++;
	if (bucket.count > MAX) {
		return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
	}
	return { ok: true };
}
