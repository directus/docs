import { createDirectus, rest } from '@directus/sdk';
import type { DirectusSchema } from '~~/types/directus';

export const db = () => {
	const runtimeConfig = useRuntimeConfig();
	return createDirectus<DirectusSchema>(runtimeConfig.public.PRODUCT_DIRECTUS_URL).with(rest());
};

export const img = (id: string) => {
	const runtimeConfig = useRuntimeConfig();
	return `${runtimeConfig.public.PRODUCT_DIRECTUS_URL}/assets/${id}`;
};
