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
	typescript: {
		// typeCheck: true,
	},
	content: {
		highlight: {
			theme: {
				default: 'github-light',
				dark: 'github-dark',
			},
			langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml', 'bash', 'swift', 'python', 'graphql', 'http'],
		},
		markdown: {
			toc: {
				depth: 1,
			},
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
		headers: {
			crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
		},
	},
	css: ['~/assets/css/main.scss'],
});
