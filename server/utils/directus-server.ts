import { $fetch } from 'ofetch';
import { createDirectus, rest } from '@directus/sdk';
import type { Schema } from '#shared/types/schema';

const {
	directusUrl,
} = useRuntimeConfig();

const directusServer = createDirectus<Schema>(directusUrl as string, {
	globals: {
		fetch: $fetch,
	},
}).with(rest());

export { directusServer };
export { readItem, readItems } from '@directus/sdk';
export type { QueryFilter } from '@directus/sdk';
