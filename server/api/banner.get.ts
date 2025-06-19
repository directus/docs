import type { SiteBanner } from '#shared/types/schema';

export default defineCachedEventHandler(async (): Promise<SiteBanner | Record<string, never>> => {
	try {
		const banners = await directusServer.request(readItems('site_banners', {
			fields: ['id', 'icon', 'content', 'link'],
			filter: {
				show_on: {
					// @ts-expect-error - _contains works for csv fields in Directus
					_contains: 'docs',
				},
			},
			sort: ['-date_created'],
			limit: 1,
		}));

		return banners[0] ?? {};
	}
	catch (error) {
		console.error(error);
		return {};
	}
}, {
	maxAge: 60 * 5, // 5 minutes
	name: 'site-banner',
	swr: false,
	shouldInvalidateCache: (event) => {
		const query = getQuery(event);
		return query.refresh === 'true';
	},
});
