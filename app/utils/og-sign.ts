import { canonicalPayloadFromEntries } from '../../lib/og-signing.mjs';

export type OgTemplate = 'default' | 'docs';

export type OgParams = Record<string, string | number | boolean | null | undefined>;

export interface OgImageInput {
	template: OgTemplate;
	params: OgParams;
}

export const OG_IMAGE_VERSION = '1';

const textEncoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
	return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function signOgImage(input: OgImageInput, secret: string) {
	const params = {
		v: OG_IMAGE_VERSION,
		...input.params,
	};

	// The worker signs v both as the header version and as a query param.
	const canonical = canonicalPayloadFromEntries(input.template, String(params.v), Object.entries(params));

	const key = await crypto.subtle.importKey(
		'raw',
		textEncoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);

	const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(canonical));

	return {
		params,
		signature: toHex(signature),
	};
}

export function getOgImageUrl(baseUrl: string, template: OgTemplate, params: OgParams, signature?: string) {
	const url = new URL(`/template/${template}`, baseUrl);

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			url.searchParams.set(key, String(value));
		}
	}

	if (signature) {
		url.searchParams.set('sig', signature);
	}

	return url.toString();
}
