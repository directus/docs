import { createDirectus, rest } from '@directus/sdk';
import type { DirectusSchema } from '~~/types/directus';

export const db = createDirectus<DirectusSchema>('https://product-team.directus.app').with(rest());
