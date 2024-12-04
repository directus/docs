import { resolve } from 'path';
import { buildPages } from './server/remoteContent';

export default defineNuxtConfig({
	modules: [
		'@nuxt/eslint',
		'@vueuse/nuxt',
		'@nuxt/image',
		'@nuxt/content',
		'nuxt-security',
		'@nuxt/icon',
		'@nuxtjs/seo',
		'@nuxtjs/color-mode',
		'nuxt-posthog',
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
			fields: ['root', 'tags', 'additional_paths', 'expandable', 'description'],
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
	compatibilityDate: '2024-04-03',
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
		fonts: [
			'Poppins:600',
			'Fira+Mono:500',
		],
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
																process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
		},
	},
});
