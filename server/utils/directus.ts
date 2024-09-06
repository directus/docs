import { createDirectus, rest } from '@directus/sdk';
import type { DirectusSchema } from '~~/types/directus';

// Client with REST support
export const db = createDirectus<DirectusSchema>(
	'https://product-team.directus.app',
).with(rest());

export * from '@directus/sdk';
