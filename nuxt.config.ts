// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	extends: ["@nuxt/ui-pro"],

	compatibilityDate: "2024-11-01",

	future: {
		compatibilityVersion: 4,
	},

	modules: ["@nuxt/eslint", "@nuxt/content", "@nuxt/ui", "@nuxtjs/tailwindcss", "@nuxt/scripts"],

	nitro: {
		prerender: {
			routes: ["/"],
			crawlLinks: true,
		},
	},

	devtools: {
		enabled: true,
	},

	eslint: {
		config: {
			stylistic: {
				indent: "tab",
				semi: true,
			},
		},
	},

	icon: {
		customCollections: [
			{
				prefix: "directus",
				dir: "./app/assets/icons/products",
			},
			{
				prefix: "frameworks",
				dir: "./app/assets/icons/frameworks",
			},
		],
	},
});
