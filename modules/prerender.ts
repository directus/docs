/* Ensure all the API reference docs are prerendered when the API reference is enabled. */
import { defineNuxtModule, extendRouteRules, useLogger } from '@nuxt/kit';

export default defineNuxtModule({
	async setup() {
		const logger = useLogger();

		if (process.env.NUXT_PRERENDER_API_REFERENCE !== 'true') {
			logger.info('Skipping API reference prerender');
			return;
		}

		const [{ spec }, { default: mapOasNavigation }, { withoutTrailingSlash }] = await Promise.all([
			import('@directus/openapi'),
			import('~/utils/mapOasNavigation'),
			import('ufo'),
		]);

		logger.info('Prerendering API reference docs...');
		const permalinks = mapOasNavigation(spec).map(item => item.path).flat();

		for (const link of permalinks) {
			extendRouteRules(withoutTrailingSlash(link), {
				prerender: true,
			});
		}

		logger.info(`Added ${permalinks.length} API reference docs to prerender`);
	},
});
