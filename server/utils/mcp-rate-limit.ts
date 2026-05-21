const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkMcpRateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfter?: number } {
	const now = Date.now();
	const bucket = buckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { ok: true };
	}

	bucket.count++;
	if (bucket.count <= max) return { ok: true };

	return {
		ok: false,
		retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
	};
}
