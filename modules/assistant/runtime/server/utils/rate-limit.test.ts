import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	checkAssistantDailyLimits,
	getAssistantLimitStatus,
	ipPrefix,
	resetAssistantLimits,
	setAssistantOverride,
} from './rate-limit';

const redisClient = vi.hoisted(() => ({
	del: vi.fn(),
	expire: vi.fn(),
	get: vi.fn(),
	incr: vi.fn(),
	scan: vi.fn(),
	set: vi.fn(),
}));

const Redis = vi.hoisted(() => vi.fn(() => redisClient));

vi.mock('@upstash/redis', () => ({ Redis }));

type DailyInputOptions = {
	ip?: string;
	fingerprint?: string;
	fingerprintEntropy?: 'high' | 'low';
};

function dailyInput(options: DailyInputOptions = {}) {
	const ip = options.ip ?? '203.0.113.10';
	return {
		ip,
		fingerprint: options.fingerprint ?? 'fp_test',
		fingerprintEntropy: options.fingerprintEntropy ?? 'high',
		ipPrefix: ipPrefix(ip),
	};
}

let savedEnv: NodeJS.ProcessEnv;

beforeEach(async () => {
	savedEnv = { ...process.env };
	delete process.env.UPSTASH_REDIS_REST_URL;
	delete process.env.UPSTASH_REDIS_REST_TOKEN;
	delete process.env.KV_REST_API_URL;
	delete process.env.KV_REST_API_TOKEN;
	redisClient.del.mockResolvedValue(0);
	redisClient.expire.mockResolvedValue(undefined);
	redisClient.get.mockResolvedValue(null);
	redisClient.incr.mockResolvedValue(1);
	redisClient.scan.mockResolvedValue([0, []]);
	redisClient.set.mockResolvedValue(undefined);
	Redis.mockClear();
	await resetAssistantLimits();
});

afterEach(async () => {
	process.env = savedEnv;
	await resetAssistantLimits();
	vi.clearAllMocks();
});

describe('checkAssistantDailyLimits', () => {
	it('normalizes compressed IPv6 addresses to a stable /64 prefix', () => {
		expect(ipPrefix('2001:db8::1')).toBe('2001:db8:0:0::/64');
		expect(ipPrefix('2001:db8:0:0:abcd::1')).toBe('2001:db8:0:0::/64');
		expect(ipPrefix('2001:db8:abcd:1234:1::1')).toBe('2001:db8:abcd:1234::/64');
	});

	it('fails closed when the exact IP limit is exceeded', async () => {
		let result = await checkAssistantDailyLimits(dailyInput());
		for (let i = 1; i < 31; i++) result = await checkAssistantDailyLimits(dailyInput());

		expect(result.ok).toBe(false);
		expect(result.reason).toBe('exact_ip');
		expect(result.counts.exactIp).toBe(31);
		expect(result.remainingExactIp).toBe(0);
		expect(result.retryAfter).toBeGreaterThan(0);
	});

	it('degrades but allows requests when an IP prefix crosses the shared limit', async () => {
		let result = await checkAssistantDailyLimits(dailyInput());
		for (let i = 0; i < 501; i++) {
			result = await checkAssistantDailyLimits(dailyInput({
				ip: `2001:db8:abcd:1234:${i.toString(16)}::1`,
				fingerprint: `fp_prefix_${i}`,
			}));
		}

		expect(result.ok).toBe(true);
		expect(result.mode).toBe('degraded');
		expect(result.reason).toBe('shared_key');
		expect(result.counts.prefix).toBe(501);
	});

	it('degrades but allows requests when a high-entropy fingerprint crosses the shared limit', async () => {
		let result = await checkAssistantDailyLimits(dailyInput());
		for (let i = 0; i < 201; i++) {
			result = await checkAssistantDailyLimits(dailyInput({
				ip: `2001:db8:${i.toString(16)}:abcd::1`,
				fingerprint: 'fp_shared',
			}));
		}

		expect(result.ok).toBe(true);
		expect(result.mode).toBe('degraded');
		expect(result.reason).toBe('shared_key');
		expect(result.counts.fingerprint).toBe(201);
	});

	it('does not count low-entropy fingerprints against the fingerprint key', async () => {
		let result = await checkAssistantDailyLimits(dailyInput());
		for (let i = 0; i < 201; i++) {
			result = await checkAssistantDailyLimits(dailyInput({
				ip: `2001:db8:${i.toString(16)}:abcd::1`,
				fingerprint: 'fp_low_entropy',
				fingerprintEntropy: 'low',
			}));
		}

		expect(result.ok).toBe(true);
		expect(result.mode).toBe('normal');
		expect(result.counts.fingerprint).toBe(0);
	});

	it('honors fingerprint overrides without incrementing daily counters', async () => {
		await setAssistantOverride('fp_override');

		const result = await checkAssistantDailyLimits(dailyInput({ fingerprint: 'fp_override' }));
		const status = await getAssistantLimitStatus(dailyInput({ fingerprint: 'fp_override' }));

		expect(result.ok).toBe(true);
		expect(result.counts).toEqual({});
		expect(status.exactIp).toBe(0);
		expect(status.fingerprint).toBe(0);
	});

	it('fails closed when the KV store errors', async () => {
		process.env.UPSTASH_REDIS_REST_URL = 'https://example-upstash.test';
		process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
		redisClient.incr.mockRejectedValue(new Error('kv down'));
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await checkAssistantDailyLimits(dailyInput());

		expect(result.ok).toBe(false);
		expect(result.reason).toBe('kv_error');
		expect(result.retryAfter).toBe(60);
		expect(result.remainingExactIp).toBe(0);
		errorSpy.mockRestore();
	});
});
