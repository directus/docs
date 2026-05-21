import { createHash, createHmac } from 'node:crypto';
import type { H3Event } from 'h3';

export type FingerprintResult = {
	fingerprint: string;
	entropy: 'high' | 'low';
	posthogDistinctId: string;
};

function hashHex(value: string): string {
	return createHash('sha256').update(value).digest('hex');
}

export function fingerprintFromEvent(event: H3Event): FingerprintResult {
	const ua = getHeader(event, 'user-agent') || '';
	const language = getHeader(event, 'accept-language') || '';
	const encoding = getHeader(event, 'accept-encoding') || '';
	const chUa = getHeader(event, 'sec-ch-ua') || '';
	const platform = getHeader(event, 'sec-ch-ua-platform') || '';
	const mobile = getHeader(event, 'sec-ch-ua-mobile') || '';
	const raw = [ua, language, encoding, chUa, platform, mobile].join('\n');
	const fingerprint = hashHex(raw).slice(0, 16);
	const entropy = chUa ? 'high' : 'low';

	return {
		fingerprint,
		entropy,
		posthogDistinctId: posthogDistinctId(fingerprint),
	};
}

export function posthogDistinctId(fingerprint: string, now = new Date()): string {
	const secret = process.env.ASSISTANT_FP_SECRET || 'missing-assistant-fp-secret';
	const day = now.toISOString().slice(0, 10);
	const salt = createHmac('sha256', secret).update(day).digest('hex');
	return hashHex(`${salt}:${fingerprint}`).slice(0, 32);
}
