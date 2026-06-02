import { getHeader, type H3Event } from 'h3';

export type GateVerdict = 'trusted' | 'suspicious' | 'blocked';

export type AbuseGateInput = {
	origin?: string;
	referer?: string;
	secFetchSite?: string;
	secFetchMode?: string;
	secFetchDest?: string;
	userAgent?: string;
	acceptLanguage?: string;
	host?: string;
	vercelEnv?: string;
	vercelUrl?: string;
	nodeEnv?: string;
};

export type AbuseGateResult = {
	verdict: GateVerdict;
	reason?: string;
};

function originOf(value: string | undefined): string | null {
	if (!value) return null;
	try {
		return new URL(value).origin;
	}
	catch {
		return null;
	}
}

function isDev(input: AbuseGateInput): boolean {
	if (input.vercelEnv === 'production' || input.vercelEnv === 'preview') return false;
	if (input.nodeEnv !== 'production') return true;
	return Boolean(input.host?.startsWith('localhost:') || input.host?.startsWith('127.0.0.1:'));
}

function allowedOrigins(input: AbuseGateInput): Set<string> {
	const origins = new Set(['https://directus.io', 'https://www.directus.io']);
	if (input.vercelEnv === 'preview' && input.vercelUrl) origins.add(`https://${input.vercelUrl}`);
	if (isDev(input)) {
		origins.add('http://localhost:3000');
		origins.add('http://localhost:3001');
		origins.add('http://127.0.0.1:3000');
		origins.add('http://127.0.0.1:3001');
	}
	return origins;
}

function isAllowed(origin: string | null, allowed: Set<string>, dev: boolean): boolean {
	if (!origin) return false;
	if (allowed.has(origin)) return true;
	if (!dev) return false;
	try {
		const url = new URL(origin);
		return url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
	}
	catch {
		return false;
	}
}

export function abuseGate(input: AbuseGateInput): AbuseGateResult {
	const allowed = allowedOrigins(input);
	const dev = isDev(input);
	const origin = originOf(input.origin);
	const referer = originOf(input.referer);
	const originOk = isAllowed(origin, allowed, dev);
	const refererOk = isAllowed(referer, allowed, dev);

	if (!originOk && !refererOk) return { verdict: 'blocked', reason: 'bad_origin_referer' };

	const ua = input.userAgent || '';
	const uaOk = ua.length >= 20 && ua.length <= 500 && /(Mozilla|Safari|Chrome|Firefox|Edge)/i.test(ua);
	const fetchOk = input.secFetchSite === 'same-origin'
		&& input.secFetchMode === 'cors'
		&& input.secFetchDest === 'empty';
	const langOk = Boolean(input.acceptLanguage);

	if (originOk && refererOk && uaOk && fetchOk && langOk) return { verdict: 'trusted' };
	return { verdict: 'suspicious', reason: [fetchOk ? '' : 'fetch_headers', uaOk ? '' : 'ua', langOk ? '' : 'language'].filter(Boolean).join(',') || 'partial_headers' };
}

export function abuseGateFromEvent(event: H3Event): AbuseGateResult {
	return abuseGate({
		origin: getHeader(event, 'origin'),
		referer: getHeader(event, 'referer'),
		secFetchSite: getHeader(event, 'sec-fetch-site'),
		secFetchMode: getHeader(event, 'sec-fetch-mode'),
		secFetchDest: getHeader(event, 'sec-fetch-dest'),
		userAgent: getHeader(event, 'user-agent'),
		acceptLanguage: getHeader(event, 'accept-language'),
		host: getHeader(event, 'host'),
		vercelEnv: process.env.VERCEL_ENV,
		vercelUrl: process.env.VERCEL_URL,
		nodeEnv: process.env.NODE_ENV,
	});
}
