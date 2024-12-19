// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	extends: ['@nuxt/ui-pro'],

	modules: [
		'@nuxt/eslint',
		'@nuxt/content',
		'@nuxt/ui',
		'@nuxtjs/tailwindcss',
		'@nuxt/scripts',
		'@vueuse/nuxt',
		'nuxt-link-checker',
	],

	devtools: {
		enabled: true,
	},

	content: {
		highlight: {
			theme: {
				default: 'github-light',
				dark: 'github-dark',
			},
			langs: [
				'bash',
				'cpp',
				'css',
				'dart',
				'diff',
				'dockerfile',
				'graphql',
				'groovy',
				'html',
				'http',
				'ini',
				'java',
				'jinja',
				'js',
				'json',
				'jsx',
				'kotlin',
				'liquid',
				'liquid',
				'md',
				'mdc',
				'nginx',
				'php',
				'python',
				'scss',
				'shell',
				'svelte',
				'swift',
				'ts',
				'tsx',
				'vue',
				'xml',
				'yaml',
			],
		},
		markdown: {
			toc: {
				depth: 1,
			},
		},
	},

	routeRules: {
		'/guides/auth': { redirect: '/guides/auth/quickstart' },
		'/guides/automate': { redirect: '/guides/automate/quickstart' },
		'/guides/content': { redirect: '/guides/content/explore' },
		'/guides/data-model': { redirect: '/guides/data-model/quickstart' },
		'/guides/extensions': { redirect: '/guides/extensions/overview' },
		'/guides/files': { redirect: '/guides/files/quickstart' },
		'/guides/insights': { redirect: '/guides/insights/overview' },
		'/guides/realtime': { redirect: '/guides/realtime/quickstart' },
	},

	future: {
		compatibilityVersion: 4,
	},

	compatibilityDate: '2024-11-01',

	nitro: {
		prerender: {
			routes: ['/'],
			crawlLinks: true,
		},
	},

	hooks: {
		// Make the Landing components available for use on the homepage in md
		'components:extend': (components) => {
			const globals = components.filter((c) => {
				return c.kebabName.startsWith('u-landing-');
			});

			globals.forEach(c => (c.global = true));
		},
	},

	eslint: {
		config: {
			stylistic: {
				indent: 'tab',
				semi: true,
			},
		},
	},

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
