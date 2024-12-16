// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	extends: ["@nuxt/ui-pro"],

	compatibilityDate: "2024-11-01",

	future: {
		compatibilityVersion: 4,
	},

	modules: ["@nuxt/eslint", "@nuxt/content", "@nuxt/ui"],

	hooks: {
		// Make all prose components available in content
		"components:extend": (components) => {
			const globals = components.filter((c) => {
				return c.shortPath.startsWith('components/prose/');
			});

			globals.forEach((c) => c.global = true);
		},
	},

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

	tailwindcss: {
		extend: {
			colors: {
				"electric-violet": {
					"50": "#f3f2ff",
					"100": "#e9e8ff",
					"200": "#d6d4ff",
					"300": "#b8b1ff",
					"400": "#9585ff",
					"500": "#6644ff",
					"600": "#6030f7",
					"700": "#531ee3",
					"800": "#4418bf",
					"900": "#39169c",
					"950": "#210b6a",
				},
			},
		},
	},
});
