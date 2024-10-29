import { createDirectus, rest } from '@directus/sdk';
import type { DirectusSchema } from '~~/types/directus';

export const db = createDirectus<DirectusSchema>(
	process.env.NUXT_PUBLIC_PRODUCT_DIRECTUS_URL as string,
).with(rest());

export * from '@directus/sdk';
