// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
				extends: ['@nuxt/ui-pro'],

				modules: [
								'@nuxt/eslint',
								'@nuxt/content',
								'@nuxt/ui',
								'@nuxtjs/tailwindcss',
								'@nuxt/scripts',
								'@nuxtjs/seo',
								'@vueuse/nuxt',
								'nuxt-posthog',
								'@nuxtjs/algolia',
				],

				devtools: {
								enabled: false,
				},

				app: {
								baseURL: '/docs/',
				},

				css: [
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
								markdown: {
												toc: {
																depth: 1,
												},
								},
				},

				build: {
								transpile: ['shiki'],
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
												//
												// This one again rears it's head, I fear. As a build error was present on another URL ending with </span
												// This should ignore all URLs that end </span
												// ~ Kevin 02/12/2025
												ignore: ['.*</span$'],
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
