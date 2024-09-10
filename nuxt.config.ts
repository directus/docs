import { resolve } from 'path';
import fs from 'node:fs/promises';
import { docPages } from './server/utils/directus';

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
	routeRules: {
		'/**': { prerender: true },
	},
	hooks: {
		async ready() {
			const docs = await docPages();

			const remotePath = resolve(__dirname, '.remote');

			if (await fs.access(remotePath).then(() => true).catch(() => false)) {
				await fs.rm(remotePath, { recursive: true });
			}

			for (const area of docs) {
				if (!area.categories) continue;
				for (const category of area.categories) {
					if (!category.pages) continue;
					for (const page of category.pages) {
						const pagePath = resolve(remotePath, `${area.sort}.${area.slug}`, `${category.sort}.${category.slug}`, `${page.sort}.${page.slug}` + '.md');
						const pageContent = `---\ntitle: "${page.title}"\n---\n${page.content}`;
						await fs.mkdir(resolve(remotePath, `${area.sort}.${area.slug}`, `${category.sort}.${category.slug}`), { recursive: true });
						await fs.writeFile(pagePath, pageContent);
					}
				}
			}
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
			crossOriginEmbedderPolicy:
        process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
		},
	},
	css: ['~/assets/css/main.scss'],
	experimental: {
		inlineRouteRules: true,
	},
});
