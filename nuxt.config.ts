// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },
	future: {
		compatibilityVersion: 4,
	},
	extends: ["@nuxt/ui-pro"],
	modules: ["@nuxt/eslint", "@nuxt/content", "@nuxt/ui"],
	icon: {
		customCollections: [
			{
				prefix: 'directus',
				dir: './app/assets/icons/products',
			},
			{
				prefix: 'frameworks',
				dir: './app/assets/icons/frameworks',
			},
		],
	},
});
