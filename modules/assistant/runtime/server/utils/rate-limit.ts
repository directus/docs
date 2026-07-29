// Daily limits use Vercel KV when configured, with process-memory fallback for
// local dev. Burst limits live in the shared server/utils/rate-limit module.

interface Bucket {
	count: number;
	resetAt: number;
}

const dailyMemory = new Map<string, Bucket>();

export type DailyLimitInput = {
	ip: string;
	fingerprint: string;
	fingerprintEntropy: 'high' | 'low';
	ipPrefix: string;
};

export type DailyLimitResult = {
	ok: boolean;
	mode: 'normal' | 'degraded';
	reason?: string;
	retryAfter?: number;
	resetAt: string;
	counts: Record<string, number>;
	remainingExactIp: number;
};

const LIMITS = {
	exactIp: 30,
	ipPrefix: 500,
	fingerprint: 200,
	combo: 50,
};

export function secondsUntilUtcMidnight(now = new Date()): number {
	const reset = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) / 1000;
	return Math.max(1, Math.ceil(reset - now.getTime() / 1000));
}

export function utcResetAt(now = new Date()): string {
	return new Date(now.getTime() + secondsUntilUtcMidnight(now) * 1000).toISOString();
}

function ipv6Prefix64(ip: string): string | null {
	const address = ip.toLowerCase().split('%')[0] ?? ip.toLowerCase();
	if (!address.includes(':')) return null;

	const parts = address.split('::');
	if (parts.length > 2) return null;

	const head = parts[0] ? parts[0].split(':') : [];
	const tail = parts[1] ? parts[1].split(':') : [];
	if ([...head, ...tail].some(part => !/^[0-9a-f]{1,4}$/.test(part))) return null;

	const missing = 8 - head.length - tail.length;
	if (missing < 0 || (parts.length === 1 && missing !== 0)) return null;

	const full = [...head, ...Array.from({ length: missing }, () => '0'), ...tail];
	if (full.length !== 8) return null;

	return `${full.slice(0, 4).map(part => Number.parseInt(part, 16).toString(16)).join(':')}::/64`;
}

export function ipPrefix(ip: string): string {
	if (!ip || ip === 'unknown') return 'unknown';
	const first = ip.split(',')[0]?.trim() || ip;
	if (/^\d+\.\d+\.\d+\.\d+$/.test(first)) return first.split('.').slice(0, 3).join('.') + '.0/24';
	const ipv6 = ipv6Prefix64(first);
	if (ipv6) return ipv6;
	return first;
}

function dailyKey(kind: string, value: string, now = new Date()): string {
	return `assistant:daily:${now.toISOString().slice(0, 10)}:${kind}:${value}`;
}

function upstashUrl(): string | undefined {
	return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
}

function upstashToken(): string | undefined {
	return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
}

function hasKvEnv(): boolean {
	return Boolean(upstashUrl() && upstashToken());
}

async function kvClient() {
	const { Redis } = await import('@upstash/redis');
	return new Redis({ url: upstashUrl()!, token: upstashToken()! });
}

async function kvIncr(key: string, ttl: number): Promise<number> {
	const kv = await kvClient();
	const count = await kv.incr(key);
	if (count === 1) await kv.expire(key, ttl);
	return count;
}

async function kvGetNumber(key: string): Promise<number> {
	const kv = await kvClient();
	return Number(await kv.get(key) || 0);
}

async function kvSet(key: string, value: string, ttl: number): Promise<void> {
	const kv = await kvClient();
	await kv.set(key, value, { ex: ttl });
}

async function kvDel(pattern: string): Promise<number> {
	const kv = await kvClient();
	let cursor = 0;
	let deleted = 0;
	do {
		const [next, keys] = await kv.scan(cursor, { match: pattern, count: 100 });
		cursor = Number(next);
		if (keys.length > 0) deleted += await kv.del(...keys);
	} while (cursor !== 0);
	return deleted;
}

function memoryIncr(key: string, ttl: number): number {
	const now = Date.now();
	const resetAt = now + ttl * 1000;
	const bucket = dailyMemory.get(key);
	if (!bucket || bucket.resetAt < now) {
		dailyMemory.set(key, { count: 1, resetAt });
		return 1;
	}
	bucket.count++;
	return bucket.count;
}

function memoryGet(key: string): number {
	const bucket = dailyMemory.get(key);
	if (!bucket || bucket.resetAt < Date.now()) return 0;
	return bucket.count;
}

async function getOverride(fingerprint: string): Promise<boolean> {
	const key = `assistant:override:${fingerprint}`;
	if (hasKvEnv()) {
		const kv = await kvClient();
		return Boolean(await kv.get(key));
	}
	return Boolean(memoryGet(key));
}

export async function setAssistantOverride(fingerprint: string, ttlSeconds = 86400): Promise<void> {
	const key = `assistant:override:${fingerprint}`;
	if (hasKvEnv()) await kvSet(key, '1', ttlSeconds);
	else dailyMemory.set(key, { count: 1, resetAt: Date.now() + ttlSeconds * 1000 });
}

export async function checkAssistantDailyLimits(input: DailyLimitInput): Promise<DailyLimitResult> {
	const ttl = secondsUntilUtcMidnight();
	const resetAt = utcResetAt();
	const keys = {
		exactIp: dailyKey('ip', input.ip),
		ipPrefix: dailyKey('prefix', input.ipPrefix),
		fingerprint: dailyKey('fp', input.fingerprint),
		combo: dailyKey('combo', `${input.ip}:${input.fingerprint}`),
	};

	try {
		if (await getOverride(input.fingerprint)) {
			return { ok: true, mode: 'normal', resetAt, counts: {}, remainingExactIp: LIMITS.exactIp };
		}

		const counts = hasKvEnv()
			? await Promise.all([
					kvIncr(keys.exactIp, ttl),
					kvIncr(keys.ipPrefix, ttl),
					input.fingerprintEntropy === 'high' ? kvIncr(keys.fingerprint, ttl) : Promise.resolve(0),
					kvIncr(keys.combo, ttl),
				])
			: [
					memoryIncr(keys.exactIp, ttl),
					memoryIncr(keys.ipPrefix, ttl),
					input.fingerprintEntropy === 'high' ? memoryIncr(keys.fingerprint, ttl) : 0,
					memoryIncr(keys.combo, ttl),
				];

		const exactIp = counts[0] ?? 0;
		const prefix = counts[1] ?? 0;
		const fingerprint = counts[2] ?? 0;
		const combo = counts[3] ?? 0;
		const hitExact = exactIp > LIMITS.exactIp;
		const hitCombo = combo > LIMITS.combo;
		const sharedHit = prefix > LIMITS.ipPrefix || fingerprint > LIMITS.fingerprint;

		if (hitExact || hitCombo) {
			return {
				ok: false,
				mode: 'degraded',
				reason: hitExact ? 'exact_ip' : 'combo',
				retryAfter: ttl,
				resetAt,
				counts: { exactIp, prefix, fingerprint, combo },
				remainingExactIp: Math.max(0, LIMITS.exactIp - exactIp),
			};
		}

		return {
			ok: true,
			mode: sharedHit ? 'degraded' : 'normal',
			reason: sharedHit ? 'shared_key' : undefined,
			resetAt,
			counts: { exactIp, prefix, fingerprint, combo },
			remainingExactIp: Math.max(0, LIMITS.exactIp - exactIp),
		};
	}
	catch (error) {
		console.error('[assistant] daily rate limit failed closed', error);
		return { ok: false, mode: 'degraded', reason: 'kv_error', retryAfter: 60, resetAt, counts: {}, remainingExactIp: 0 };
	}
}

export async function getAssistantLimitStatus(input: DailyLimitInput): Promise<Record<string, number | string>> {
	const keys = {
		exactIp: dailyKey('ip', input.ip),
		ipPrefix: dailyKey('prefix', input.ipPrefix),
		fingerprint: dailyKey('fp', input.fingerprint),
		combo: dailyKey('combo', `${input.ip}:${input.fingerprint}`),
	};
	const read = hasKvEnv() ? kvGetNumber : async (key: string) => memoryGet(key);
	return {
		store: hasKvEnv() ? 'vercel-kv' : 'memory',
		resetAt: utcResetAt(),
		exactIp: await read(keys.exactIp),
		ipPrefix: await read(keys.ipPrefix),
		fingerprint: await read(keys.fingerprint),
		combo: await read(keys.combo),
	};
}

export async function resetAssistantLimits(): Promise<number> {
	if (hasKvEnv()) return kvDel('assistant:daily:*');
	const count = dailyMemory.size;
	dailyMemory.clear();
	return count;
}

export function assistantRateLimitStore(): string {
	return hasKvEnv() ? 'vercel-kv' : 'memory';
}
