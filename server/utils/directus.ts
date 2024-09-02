import { createDirectus, rest, readItems } from '@directus/sdk';
import type { DirectusSchema } from '~~/types/directus';

// Client with REST support
export const db = createDirectus<DirectusSchema>('https://product-team.directus.app').with(rest());

export const docPages = async () => {
	const data = await db.request(
		readItems('documentation_area', {
			fields: ['id', 'slug', 'type', 'sort', { categories: ['id', 'slug', 'sort', { pages: ['id', 'slug', 'title', 'content', 'sort'] }] }],
		}),
	);

	return data;
};
