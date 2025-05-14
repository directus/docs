// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

	modules: [
		'@nuxt/eslint',
		'@nuxt/ui-pro',
		'@nuxt/content',
		'@nuxt/scripts',
		'@nuxtjs/seo',
		'@vueuse/nuxt',
		'nuxt-posthog',
		'@nuxtjs/algolia',
	],

	devtools: {
		enabled: true,
	},

	app: {
		baseURL: '/docs',
	},

	css: [
		'~/assets/css/main.css',
		'~/assets/css/algolia.css',
	],

	site: {
		url: 'https://directus.io',
		name: 'Directus Docs',
		description: 'Explore our resources and powerful data engine to build your projects confidently.',
		defaultLocale: 'en-US',
	},

	colorMode: {
		dataValue: 'theme',
	},

	content: {
		build: {
			markdown: {
				toc: {
					searchDepth: 1,
				},
				// highlight: false,
				highlight: {
					theme: {
						default: 'github-light',
						light: 'github-light',
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
			},
		},
	},

	mdc: {
		highlight: {
			noApiRoute: false,
		},
	},

	build: {
		// transpile: ['shiki'],
	},

	future: {
		compatibilityVersion: 4,
	},

	compatibilityDate: '2024-11-01',

	nitro: {
		prerender: {
			routes: [
				'/',
			],

			crawlLinks: true,

			// TODO
			// This is a dirty hack to get around a build blocking error..
			// I can't for the life of me figure out where this magic </span link comes from
			// ~ Rijk 12/19/2024
			ignore: [
				// 'http://localhost/docs/api/_mdc/highlight',
				'/docs/api/</span',
				'/docs/tutorials/getting-started/{`/${lang}/${post.slug}/`}>{t?.title}</a>\n</span',
				'/docs/tutorials/getting-started/{href || &',
				'/docs/tutorials/getting-started/{`/${post.id}`}></span',
				'/docs/tutorials/getting-started/{item.href}>{item.label}</a></span',
				'/docs/tutorials/getting-started/{`/dashboard/posts/${post.id}`}>edit post</a></span',
			],

			concurrency: 3,
			retry: 2,
			retryDelay: 1000,
		},
	},

	algolia: {
		docSearch: {
			indexName: 'directus_unified',
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
		],
		clientBundle: {
			scan: true,
			includeCustomCollections: true,
		},
	},

	robots: {
		robotsTxt: false,
	},
});
