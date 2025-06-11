/* Ensure all the API reference docs are prerendered */
import { spec } from '@directus/openapi';
import { defineNuxtModule, extendRouteRules, useLogger } from '@nuxt/kit';
import { withoutTrailingSlash } from 'ufo';
import mapOasNavigation from '~/utils/mapOasNavigation';

export default defineNuxtModule({
	async setup(_moduleOptions, _nuxt) {
		const logger = useLogger();

		logger.info('Prerendering API reference docs...');
		// Use existing helper to map the OAS to a navigation object and just return the paths
		const permalinks = mapOasNavigation(spec).map(item => item.path).flat();

		for (const link of permalinks) {
			extendRouteRules(withoutTrailingSlash(link), {
				prerender: true,
			});
		}

		logger.info(`Added ${permalinks.length} API reference docs to prerender`);
	},
});
