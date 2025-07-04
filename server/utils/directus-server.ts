import { $fetch } from 'ofetch';
import {
	createDirectus,
	readItem,
	readItems,
	rest,
	type QueryFilter,
} from '@directus/sdk';
import type { Schema } from '#shared/types/schema';

const {
	directusUrl,
} = useRuntimeConfig();

const directusServer = createDirectus<Schema>(directusUrl as string, {
	globals: {
		fetch: $fetch,
	},
}).with(rest());

export {
	directusServer,
	readItem,
	readItems,
};
export type { QueryFilter };
