// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	extends: ["@nuxt/ui-pro"],

	compatibilityDate: "2024-11-01",

	future: {
		compatibilityVersion: 4,
	},

	modules: ["@nuxt/eslint", "@nuxt/content", "@nuxt/ui", "@nuxtjs/tailwindcss", "@nuxt/scripts", "@vueuse/nuxt"],

	routeRules: {
		'/docs': { redirect: '/docs/getting-started/platform-overview' },
		'/cloud': { redirect: '/cloud/getting-started/introduction' },
		'/community': { redirect: '/community/overview/welcome' },
	},

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

	content: {
		highlight: {
			theme: {
				default: "github-light",
				dark: "github-dark",
			},
			langs: [
				"json",
				"js",
				"ts",
				"html",
				"css",
				"vue",
				"shell",
				"mdc",
				"md",
				"yaml",
				"bash",
				"swift",
				"python",
				"graphql",
				"http",
				"jinja",
				"dart",
				"groovy",
				"kotlin",
				"svelte",
				"dockerfile",
				"ini",
				"diff",
				"liquid",
				"php",
				"liquid",
				"java",
				"xml",
				"nginx",
				"scss",
				"jsx",
				"tsx",
			],
		},
		markdown: {
			toc: {
				depth: 1,
			},
		},
	},
});
