import { defineNuxtPlugin, useCookie, useRuntimeConfig, useState } from '#app';
import { PostHog } from 'posthog-node';
import type { JsonType } from 'posthog-js';

export default defineNuxtPlugin({
	name: 'posthog-server',
	enforce: 'pre',
	setup: async () => {
		const config = useRuntimeConfig().public.posthog;

		if (config.disabled || !config.publicKey || !config.host) {
			return {
				provide: {
					serverPosthog: null as PostHog | null,
				},
			};
		}

		const identity = useCookie<{ distinct_id?: string } | null>(`ph_${config.publicKey}_posthog`, {
			default: () => null,
			readonly: true,
			watch: false,
		});
		const distinctId = identity.value && typeof identity.value === 'object' ? identity.value.distinct_id : undefined;

		const posthog = new PostHog(config.publicKey, { host: config.host });
		let featureFlags: Record<string, boolean | string> = {};
		let featureFlagPayloads: Record<string, JsonType> = {};

		if (distinctId) {
			try {
				const flags = await posthog.getAllFlagsAndPayloads(distinctId);
				featureFlags = flags.featureFlags ?? {};
				featureFlagPayloads = flags.featureFlagPayloads ?? {};
			}
			catch (error) {
				console.warn('[posthog] failed to load feature flags', error);
			}
		}

		useState<Record<string, boolean | string> | undefined>('ph-feature-flags', () => featureFlags);
		useState<Record<string, JsonType> | undefined>('ph-feature-flag-payloads', () => featureFlagPayloads);

		return {
			provide: {
				serverPosthog: posthog,
			},
		};
	},
});
