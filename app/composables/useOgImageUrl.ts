import type { OgImageInput } from '~/utils/og-sign';
import { OG_IMAGE_VERSION, getOgImageUrl, signOgImage } from '~/utils/og-sign';

const warnedMissingSecretHosts = new Set<string>();

export async function useOgImageUrl(input: OgImageInput) {
	const key = `og-image:${JSON.stringify(input)}`;
	const state = useState<string | undefined>(key);

	if (import.meta.client) return state.value;
	if (state.value) return state.value;

	const config = useRuntimeConfig();
	const secret = config.ogSigningSecret;
	const baseUrl = config.public.ogBaseUrl;
	const hostname = new URL(baseUrl).hostname;

	if (!secret && hostname !== 'localhost') {
		if (!warnedMissingSecretHosts.has(hostname)) {
			console.warn(`Missing OG_SIGNING_SECRET or NUXT_OG_SIGNING_SECRET for ${baseUrl}`);
			warnedMissingSecretHosts.add(hostname);
		}

		return undefined;
	}

	if (!secret) {
		state.value = getOgImageUrl(baseUrl, input.template, { v: OG_IMAGE_VERSION, ...input.params });

		return state.value;
	}

	const { params, signature } = await signOgImage(input, secret);
	state.value = getOgImageUrl(baseUrl, input.template, params, signature);

	return state.value;
}
