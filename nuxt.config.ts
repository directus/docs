import { existsSync, readFileSync } from 'node:fs';
import type { NitroConfig } from 'nitropack';
import { resolveBranchTypesenseAlias } from './lib/typesenseAlias';

const directusLight = JSON.parse(readFileSync('./app/assets/shiki/directus-light.json', 'utf8'));
const directusDark = JSON.parse(readFileSync('./app/assets/shiki/directus-dark.json', 'utf8'));

const BASE_URL = '/docs';

type RedirectStatusCode = 301 | 302 | 307 | 308;

interface RedirectRule {
	to: string;
	statusCode: RedirectStatusCode;
}

function loadRedirectRouteRules(): NitroConfig['routeRules'] {
	if (!existsSync('redirects.json')) return {};
	const raw = readFileSync('redirects.json', 'utf8').trim();
	if (!raw) return {};
	const entries = JSON.parse(raw) as Record<string, RedirectRule>;
	const rules: NitroConfig['routeRules'] = {};
	for (const [from, rule] of Object.entries(entries)) {
		rules[from] = { redirect: { to: `${BASE_URL}${rule.to}`, statusCode: rule.statusCode } };
	}
	return rules;
}

function loadApiReferencePrerenderRoutes(): string[] {
	const path = './app/generated/api-reference/routes.json';
	if (!existsSync(path)) {
		throw new Error('Missing generated API reference routes. Run `pnpm api-ref:generate` before Nuxt.');
	}

	const raw = readFileSync(path, 'utf8').trim();
	if (!raw) {
		throw new Error('Generated API reference routes are empty. Run `pnpm api-ref:generate`.');
	}

	const routes = JSON.parse(raw) as string[];
	if (routes.length === 0) {
		throw new Error('Generated API reference routes are empty. Run `pnpm api-ref:generate`.');
	}

	return routes;
}

const typesenseCollection = process.env.TYPESENSE_COLLECTION || resolveBranchTypesenseAlias() || undefined;
const apiReferencePrerenderRoutes = loadApiReferencePrerenderRoutes();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxt/eslint',
		'@nuxt/ui',
		'nuxt-llms',
		'@nuxt/content',
		'@nuxt/scripts',
		'@nuxtjs/robots',
		'@nuxtjs/sitemap',
		'@vueuse/nuxt',
		'@nuxtjs/mcp-toolkit',
		'~~/modules/content-markdown',
	],

	devtools: {
		enabled: true,
	},

	app: {
		baseURL: BASE_URL,
	},

	css: ['~/assets/css/main.css'],

	site: {
		name: 'Directus Docs',
		description:
			'Explore our resources and powerful data engine to build your projects confidently.',
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
						default: directusLight as never,
						light: directusLight as never,
						dark: directusDark as never,
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

	runtimeConfig: {
		ogSigningSecret: process.env.NUXT_OG_SIGNING_SECRET ?? process.env.OG_SIGNING_SECRET,
		public: {
			scripts: {
				googleTagManager: {
					id: process.env.GOOGLE_TAG_MANAGER_ID!,
				},
			},
			typesenseUrl: process.env.TYPESENSE_URL,
			typesensePublicApiKey: process.env.TYPESENSE_PUBLIC_API_KEY,
			typesenseCollection,
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
			ogBaseUrl: process.env.NUXT_PUBLIC_OG_BASE_URL || 'https://og.directus.com',
		},
		directusUrl: process.env.DIRECTUS_URL,
	},

	build: {
		transpile: ['shiki'],
	},

	routeRules: {
		...loadRedirectRouteRules(),
		'/api/**': { prerender: true },
		'/docs/api/**': { prerender: true },
		'/mcp/deeplink': { prerender: false },
		'/docs/mcp/deeplink': { prerender: false },
		'/llms-full.txt': { prerender: false },
		'/docs/llms-full.txt': { prerender: false },
	},

	sourcemap: false,

	future: {
		compatibilityVersion: 4,
	},

	compatibilityDate: '2024-11-01',

	nitro: {
		compressPublicAssets: false,
		externals: {
			inline: ['unhead'],
		},
		experimental: {
			asyncContext: true,
		},
		prerender: {
			routes: ['/', '/api', ...apiReferencePrerenderRoutes],
			crawlLinks: true,
			ignore: [/^\/docs\/mcp\/deeplink(\?.*)?$/],
			concurrency: 1,
			retry: 2,
			retryDelay: 1000,
		},
	},

	eslint: {
		config: {
			stylistic: {
				indent: 'tab',
				semi: true,
				quotes: 'single',
			},
		},
	},

	fonts: {
		families: [
			{ name: 'Inter', weights: [400, 500, 600, 700], global: true },
			{ name: 'Source Serif 4', weights: [400, 500, 600], global: true },
			{ name: 'IBM Plex Mono', weights: [400, 500, 600], global: true },
		],
	},

	icon: {
		serverBundle: {
			collections: ['material-symbols', 'simple-icons'],
		},
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

	llms: {
		domain: 'https://directus.com/docs',
		title: 'Directus Documentation',
		description:
			'Directus is a real-time API and no-code Data Studio for managing any SQL database. It provides REST and GraphQL APIs, granular access control, authentication, file storage, automations, realtime via WebSockets, analytics dashboards, AI integration, and a full extension system. The Data Studio is a web application for non-technical users to browse, manage, and visualize data without writing code.',
		full: {
			title: 'Complete Directus Documentation',
			description: 'All Directus documentation pages in a single file.',
		},
		sections: [
			{
				title: 'Getting Started',
				description:
					'Introduction to Directus concepts, project creation, first steps with the API, authentication, file uploads, automations, and realtime.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/getting-started%' },
				],
			},
			{
				title: 'Guides - Data Model',
				description:
					'Creating and configuring collections, fields, relationships, and interfaces in Directus.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/data-model%' },
				],
			},
			{
				title: 'Guides - Content',
				description:
					'Browsing, filtering, editing, importing/exporting, and managing items in the Data Studio. Includes live preview, content versioning, translations, visual editor, and collaborative editing.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/content%' },
				],
			},
			{
				title: 'Guides - Auth',
				description:
					'Access tokens, cookie-based auth, access control policies, user creation, email login, two-factor authentication, accountability, and SSO configuration.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/auth%' },
				],
			},
			{
				title: 'Guides - APIs',
				description:
					'Using the Directus REST and GraphQL APIs - authentication mechanics, filter operators, query parameters, pagination, relational queries, error handling, and the JavaScript/TypeScript SDK.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/connect%' },
				],
			},
			{
				title: 'Guides - Files',
				description:
					'Uploading, managing, transforming, and controlling access to files and assets.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/files%' },
				],
			},
			{
				title: 'Guides - Flows',
				description:
					'Building event-driven automations with Flows, triggers, data chains, and operations.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/automate%' },
				],
			},
			{
				title: 'Guides - Realtime',
				description:
					'WebSocket authentication, subscriptions, and real-time data actions.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/realtime%' },
				],
			},
			{
				title: 'Guides - Insights',
				description:
					'Building no-code analytics dashboards with configurable panels and visualizations.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/insights%' },
				],
			},
			{
				title: 'Guides - Extensions',
				description:
					'Extending Directus with custom interfaces, displays, layouts, panels, modules, endpoints, hooks, operations, and bundles. Includes the Marketplace and CLI.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/extensions%' },
				],
			},
			{
				title: 'Guides - AI',
				description:
					'Using the built-in AI Assistant in the Data Studio and connecting external AI tools via the MCP server.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/ai%' },
				],
			},
			{
				title: 'Guides - Integrations',
				description:
					'Connecting Directus with third-party services including n8n, Clay, Zapier, and Vercel.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/guides/integrations%' },
				],
			},
			{
				title: 'Cloud',
				description:
					'Directus Cloud managed hosting — project creation, team management, configuration, custom domains, billing, and migration.',
				contentCollection: 'content',
				contentFilters: [{ field: 'path', operator: 'LIKE', value: '/cloud%' }],
			},
			{
				title: 'Self-Hosting',
				description:
					'Running Directus on your own infrastructure — requirements, deployment, upgrades, and including extensions.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/self-hosting%' },
				],
			},
			{
				title: 'Configuration',
				description:
					'Environment variables and server configuration — database, caching, auth/SSO, email, files, flows, AI, logging, security limits, realtime, theming, and more.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/configuration%' },
				],
			},
			{
				title: 'Community',
				description:
					'Contributing to Directus — code contributions, feature requests, documentation, code of conduct, bug reporting, and community programs.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/community%' },
				],
			},
			{
				title: 'Releases',
				description:
					'Release process, monthly changelog, and breaking changes for v10 and v11.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/releases%' },
				],
			},
			{
				title: 'Tutorials',
				description:
					'Step-by-step guides and practical examples covering projects, tips and tricks, migrations, extensions, self-hosting, and workflows.',
				contentCollection: 'content',
				contentFilters: [
					{ field: 'path', operator: 'LIKE', value: '/tutorials%' },
				],
			},
		],
		notes: [
			'The interactive API Reference is generated from an OpenAPI specification and is not included in this file. Visit https://directus.com/docs/api for the full reference.',
			'The @directus/sdk package reference is in the source repository. The Connect section here covers setup, authentication, and common patterns.',
			'This documentation covers the latest version of Directus.',
			'Directus uses a Business Source License (BSL). See https://directus.com/license for license terms.',
		],
	},

	mcp: {
		name: 'Directus documentation',
		description: 'Search and read the Directus documentation.',
		browserRedirect: `${BASE_URL}/mcp-help`,
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
			googleTagManager: {
				id: process.env.GOOGLE_TAG_MANAGER_ID,
				scriptOptions: {
					trigger: 'onNuxtReady',
				},
			},
		},
	},

	sitemap: {
		zeroRuntime: true,
	},
});
