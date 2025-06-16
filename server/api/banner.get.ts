export default defineCachedEventHandler(async () => {
	try {
		const [data] = await directusServer.request(readItems('site_banners', {
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

		if (!data) return null;

		return data;
	}
	catch (error) {
		console.error(error);
		return null;
	}
}, {
	maxAge: 60 * 5, // 5 minutes
	swr: true,
});
