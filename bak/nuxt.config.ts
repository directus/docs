import { resolve } from 'path';
import { buildPages } from './server/utils/remote-content';

export default defineNuxtConfig({
	modules: [
		'@nuxt/eslint',
		'@vueuse/nuxt',
		'@nuxt/content',
		'nuxt-security',
		'@nuxt/icon',
		'@nuxtjs/seo',
		'@nuxtjs/color-mode',
		'nuxt-posthog',
		'@nuxtjs/algolia',
	],
	devtools: { enabled: true },
	css: ['~/assets/css/main.scss'],
	vue: {
		runtimeCompiler: true,
	},
	site: {
		name: 'Directus Docs',
	},
	colorMode: {
		preference: 'system',
		fallback: 'light',
		storage: 'localStorage',
		storageKey: 'nuxt-color-mode',
		classSuffix: '',
		dataValue: 'theme',
	},
	content: {
		highlight: {
			theme: {
				default: 'github-light',
				dark: 'github-dark',
			},
			langs: [
				'json',
				'js',
				'ts',
				'html',
				'css',
				'vue',
				'shell',
				'mdc',
				'md',
				'yaml',
				'bash',
				'swift',
				'python',
				'graphql',
				'http',
				'jinja',
				'dart',
				'groovy',
				'kotlin',
				'svelte',
				'dockerfile',
				'ini',
				'diff',
				'liquid',
				'php',
				'liquid',
				'java',
				'xml',
				'nginx',
				'scss',
				'jsx',
				'tsx',
			],
		},
		markdown: {
			toc: {
				depth: 1,
			},
		},
		sources: {
			remote: {
				driver: 'fs',
				prefix: '/',
				base: resolve(__dirname, '.remote'),
			},
		},
		navigation: {
			fields: [
				'root',
				'tags',
				'additional_paths',
				'expandable',
				'description',
			],
		},
	},
	runtimeConfig: {
		public: {
			INKEEP_API_KEY: '',
			INKEEP_INTEGRATION_ID: '',
			INKEEP_ORGANIZATION_ID: '',
			NEWSLETTER_URL: '',
			PRODUCT_DIRECTUS_URL: 'https://product-team.directus.app',
		},
	},
	routeRules: {
		'/**': { prerender: true },
	},
	future: {
		compatibilityVersion: 4,
	},
	experimental: {
		buildCache: false,
	},
	compatibilityDate: '2024-11-13',
	nitro: {
		prerender: {
			routes: ['/', '/api'],
			crawlLinks: false,
		},
	},
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern-compiler',
				},
			},
		},
	},
	typescript: {
		// typeCheck: true,
	},
	hooks: {
		async ready() {
			await buildPages(__dirname);
		},
	},
	algolia: {
		docSearch: {
			indexName: 'directus',
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
	ogImage: {
		fonts: ['Poppins:600', 'Fira+Mono:500'],
	},
	schemaOrg: {
		identity: {
			type: 'Organization',
			name: 'Directus',
			url: 'https://directus.io',
			logo: 'https://directus.io/images/logo-dark.svg',
		},
	},
	security: {
		rateLimiter: false,
		headers: {
			crossOriginEmbedderPolicy:
					process.env.NODE_ENV === 'development'
						? 'unsafe-none'
						: 'require-corp',
			contentSecurityPolicy: {
				'img-src': [
					'\'self\'',
					'data:',
					'https://product-team.directus.app',
					'https://marketing.directus.io',
				],
				'script-src': [
					'\'self\'', // Fallback value, will be ignored by most modern browsers (level 3)
					'https:', // Fallback value, will be ignored by most modern browsers (level 3)
					'\'unsafe-inline\'', // Fallback value, will be ignored by almost any browser (level 2)
					'\'strict-dynamic\'', // Strict CSP via 'strict-dynamic', supported by most modern browsers (level 3)
					'\'nonce-{{nonce}}\'', // Enables CSP nonce support for scripts in SSR mode, supported by almost any browser (level 2)
					'player.vimeo.com',
				],
			},
		},
	},
});