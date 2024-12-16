// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	extends: ["@nuxt/ui-pro"],

	compatibilityDate: "2024-11-01",

	future: {
		compatibilityVersion: 4,
	},

	modules: ["@nuxt/eslint", "@nuxt/content", "@nuxt/ui", "@nuxtjs/tailwindcss", "@nuxt/scripts", "@vueuse/nuxt"],

	nitro: {
		prerender: {
			routes: ["/"],
			crawlLinks: true,
		},
	},

	hooks: {
		// Make the Landing components available for use on the homepage in md
		"components:extend": (components) => {
			const globals = components.filter((c) => {
				return c.kebabName.startsWith("u-landing-");
			});

			globals.forEach((c) => (c.global = true));
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
