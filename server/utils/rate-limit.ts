// Shared fixed-window rate limiter. One algorithm, pluggable store.
//
// Counting lives in the store (memory or Upstash); limits and failure policy
// live in the policy the caller passes. Assistant daily limits stay separate
// because they track multiple keys, overrides, reset status, and degraded mode.

export interface RateLimitStore {
	// Increment the counter for `key`, returning the new count. On the first
	// increment within a window the store sets the key to expire after `ttlSeconds`.
	incr(key: string, ttlSeconds: number): Promise<number>;
}

export interface RateLimitPolicy {
	max: number;
	windowSeconds: number;
	// What to do when the store itself errors. Expensive/abusable endpoints
	// (the assistant, code search) deny; cheap public reads (docs API) allow.
	onStoreError: 'deny' | 'allow';
}

export interface RateLimitVerdict {
	ok: boolean;
	retryAfter?: number;
}

interface Bucket {
	count: number;
	resetAt: number;
}

// In-memory fixed-window store with periodic eviction of expired buckets.
class MemoryStore implements RateLimitStore {
	private buckets = new Map<string, Bucket>();
	private lastSweep = 0;

	async incr(key: string, ttlSeconds: number): Promise<number> {
		const now = Date.now();
		const windowMs = ttlSeconds * 1000;

		if (now - this.lastSweep > windowMs) {
			for (const [k, b] of this.buckets) {
				if (b.resetAt < now) this.buckets.delete(k);
			}
			this.lastSweep = now;
		}

		const bucket = this.buckets.get(key);
		if (!bucket || bucket.resetAt < now) {
			this.buckets.set(key, { count: 1, resetAt: now + windowMs });
			return 1;
		}

		bucket.count++;
		return bucket.count;
	}
}

// Upstash/Vercel KV store. INCR + EXPIRE on first hit is atomic server-side,
// so counts hold across serverless instances with no read-modify-write race.
class UpstashStore implements RateLimitStore {
	constructor(private url: string, private token: string) {}

	private async client() {
		const { Redis } = await import('@upstash/redis');
		return new Redis({ url: this.url, token: this.token });
	}

	async incr(key: string, ttlSeconds: number): Promise<number> {
		const kv = await this.client();
		const count = await kv.incr(key);
		if (count === 1) await kv.expire(key, ttlSeconds);
		return count;
	}
}

function upstashUrl(): string | undefined {
	return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
}

function upstashToken(): string | undefined {
	return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
}

let store: RateLimitStore | undefined;

// Memory when Upstash isn't configured (local dev), Upstash otherwise.
// Matches the daily-limit backend choice without sharing its deeper logic.
function defaultStore(): RateLimitStore {
	if (store) return store;
	const url = upstashUrl();
	const token = upstashToken();
	store = url && token ? new UpstashStore(url, token) : new MemoryStore();
	return store;
}

export async function checkRateLimit(
	key: string,
	policy: RateLimitPolicy,
	override?: RateLimitStore,
): Promise<RateLimitVerdict> {
	try {
		const count = await (override ?? defaultStore()).incr(key, policy.windowSeconds);
		// Stores expose count only, so retryAfter is the full fixed window.
		if (count > policy.max) return { ok: false, retryAfter: policy.windowSeconds };
		return { ok: true };
	}
	catch (error) {
		console.error('[rate-limit] store failed', error);
		if (policy.onStoreError === 'deny') return { ok: false, retryAfter: policy.windowSeconds };
		return { ok: true };
	}
}
