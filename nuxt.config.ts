import { resolve } from 'path';
import { buildPages } from './server/remoteContent';

export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },
	modules: [
		'@nuxt/eslint',
		'@vueuse/nuxt',
		'@nuxt/image',
		'@nuxt/content',
		'nuxt-security',
		'@nuxt/icon',
		'@nuxtjs/seo',
	],
	runtimeConfig: {
		public: {
			INKEEP_API_KEY: '',
			INKEEP_INTEGRATION_ID: '',
			INKEEP_ORGANIZATION_ID: '',
		},
	},
	typescript: {
		// typeCheck: true,
	},
	routeRules: {
		'/**': { prerender: true },
	},
	hooks: {
		async ready() {
			await buildPages(__dirname);
		},
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
			fields: ['tags', 'additional_paths'],
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
	site: {
		name: 'Directus Docs',
	},
	future: {
		compatibilityVersion: 4,
	},
	schemaOrg: {
		identity: {
			type: 'Organization',
			name: 'Directus',
			url: 'https://directus.io',
			logo: 'https://directus.io/images/logo-dark.svg',
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
	security: {
		rateLimiter: false,
		headers: {
			crossOriginEmbedderPolicy:
        process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
		},
	},
	css: ['~/assets/css/main.scss'],
	vue: {
		runtimeCompiler: true,
	},
	nitro: {
		prerender: {
			routes: ['/', '/api'],
			crawlLinks: false,
		},
	},
});
