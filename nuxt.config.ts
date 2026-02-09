// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

	modules: [
		'@nuxt/eslint',
		'@nuxt/ui-pro',
		'nuxt-llms',
		'@nuxt/content',
		'@nuxt/scripts',
		'@nuxtjs/seo',
		'@vueuse/nuxt',
		...((process.env.ALGOLIA_APPLICATION_ID && process.env.ALGOLIA_API_KEY)
			? ['@nuxtjs/algolia']
			: []),
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

	llms: {
		domain: 'https://directus.io/docs',
		title: 'Directus Documentation',
		description: 'Directus is a real-time API and no-code Data Studio for managing any SQL database. It provides REST and GraphQL APIs, granular access control, authentication, file storage, automations, realtime via WebSockets, analytics dashboards, AI integration, and a full extension system. The Data Studio is a web application for non-technical users to browse, manage, and visualize data without writing code.',
		full: {
			title: 'Complete Directus Documentation',
			description: 'All Directus documentation pages in a single file.',
		},
		sections: [
			{
				title: 'Getting Started',
				description: 'Introduction to Directus concepts, project creation, first steps with the API, authentication, file uploads, automations, and realtime.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/getting-started%' }],
			},
			{
				title: 'Guides - Data Model',
				description: 'Creating and configuring collections, fields, relationships, and interfaces in Directus.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/data-model%' }],
			},
			{
				title: 'Guides - Content',
				description: 'Browsing, filtering, editing, importing/exporting, and managing items in the Data Studio. Includes live preview, content versioning, translations, visual editor, and collaborative editing.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/content%' }],
			},
			{
				title: 'Guides - Auth',
				description: 'Access tokens, cookie-based auth, access control policies, user creation, email login, two-factor authentication, accountability, and SSO configuration.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/auth%' }],
			},
			{
				title: 'Guides - Connect',
				description: 'Using the Directus REST and GraphQL APIs — authentication mechanics, filter operators, query parameters, pagination, relational queries, error handling, and the JavaScript/TypeScript SDK.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/connect%' }],
			},
			{
				title: 'Guides - Files',
				description: 'Uploading, managing, transforming, and controlling access to files and assets.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/files%' }],
			},
			{
				title: 'Guides - Automate',
				description: 'Building event-driven automations with Flows, triggers, data chains, and operations.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/automate%' }],
			},
			{
				title: 'Guides - Realtime',
				description: 'WebSocket authentication, subscriptions, and real-time data actions.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/realtime%' }],
			},
			{
				title: 'Guides - Insights',
				description: 'Building no-code analytics dashboards with configurable panels and visualizations.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/insights%' }],
			},
			{
				title: 'Guides - Extensions',
				description: 'Extending Directus with custom interfaces, displays, layouts, panels, modules, endpoints, hooks, operations, and bundles. Includes the Marketplace and CLI.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/extensions%' }],
			},
			{
				title: 'Guides - AI',
				description: 'Using the built-in AI Assistant in the Data Studio and connecting external AI tools via the MCP server.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/ai%' }],
			},
			{
				title: 'Guides - Integrations',
				description: 'Connecting Directus with third-party services including n8n, Clay, Zapier, and Vercel.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guides/integrations%' }],
			},
			{
				title: 'Cloud',
				description: 'Directus Cloud managed hosting — project creation, team management, configuration, custom domains, billing, and migration.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/cloud%' }],
			},
			{
				title: 'Self-Hosting',
				description: 'Running Directus on your own infrastructure — requirements, deployment, upgrades, and including extensions.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/self-hosting%' }],
			},
			{
				title: 'Configuration',
				description: 'Environment variables and server configuration — database, caching, auth/SSO, email, files, flows, AI, logging, security limits, realtime, theming, and more.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/configuration%' }],
			},
			{
				title: 'Community',
				description: 'Contributing to Directus — code contributions, feature requests, documentation, code of conduct, bug reporting, and community programs.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/community%' }],
			},
			{
				title: 'Releases',
				description: 'Release process, monthly changelog, and breaking changes for v10 and v11.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/releases%' }],
			},
			{
				title: 'Tutorials',
				description: 'Step-by-step guides and practical examples covering projects, tips and tricks, migrations, extensions, self-hosting, and workflows.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/tutorials%' }],
			},
		],
		notes: [
			'The interactive API Reference is generated from an OpenAPI specification and is not included in this file. Visit https://directus.io/docs/api for the full reference.',
			'The @directus/sdk package reference is in the source repository. The Connect section here covers setup, authentication, and common patterns.',
			'This documentation covers the latest version of Directus.',
			'Directus uses a Business Source License (BSL). See https://directus.io/bsl for license terms.',
		],
	},

	mdc: {
		highlight: {
			noApiRoute: false,
		},
	},

	runtimeConfig: {
		public: {
			scripts: {
				googleTagManager: {
					id: process.env.GOOGLE_TAG_MANAGER_ID!,
				},
			},
		},
		directusUrl: process.env.DIRECTUS_URL,
	},

	build: {
		transpile: ['shiki'],
	},

	future: {
		compatibilityVersion: 4,
	},

	compatibilityDate: '2024-11-01',

	nitro: {
		compressPublicAssets: false,
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
				'/docs/tutorials/projects/{card.button.url} class="card-cta"></span',
				'/docs/tutorials/projects/{navItem.url}>{navItem.title}</a></span',
				'/docs/tutorials/projects/{child.url}>{child.title}</a></span',
				'/docs/tutorials/projects/{child.page.permalink}>{child.title}</a></span',
				'/docs/tutorials/projects/{navItem.page.permalink}>{navItem.title}</a></span',
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

	linkChecker: {
		skipInspections: [
			// Skip absolute site urls because of our routing setup between the docs and the main site
			'absolute-site-urls',
		],
	},

	// Disable PostHog in development
	posthog: {
		disabled: process.env.NODE_ENV === 'development',
		clientOptions: {
			person_profiles: 'always',
		},
	},

	robots: {
		robotsTxt: false,
	},

	scripts: {
		registry: {
			googleTagManager: true,
		},
	},
});
