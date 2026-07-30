export default defineAppConfig({
	search: {
		backend: 'typesense',
	},

	assistant: {
		faqQuestions: [
			{
				category: 'Getting Started',
				items: [
					'What is Directus?',
					'How do I install Directus?',
					'How do I create a collection?',
				],
			},
			{
				category: 'Frameworks',
				items: [
					'How do I fetch data from Directus in Nuxt?',
					'How do I use the Directus SDK in Next.js?',
				],
			},
			{
				category: 'Source code',
				items: [
					'Where is the items service defined in directus/directus?',
					'Show me an example of a custom Directus extension.',
				],
			},
		],
	},

	ui: {
		colors: {
			primary: 'purple',
			secondary: 'pink',
			neutral: 'neutral',
		},

		button: {
			slots: {
				base: 'rounded-l-full rounded-r-full',
			},
		},

		// Container-query overrides for Nuxt UI components, keyed off the
		// `docs-pane` parent set on <DocsShell>. These translate "narrow pane"
		// into "mobile mode" so the AI split panel can collapse the layout
		// based on pane width rather than viewport. Tailwind 4 only sees
		// literal class strings, so these stay inline (no template-string
		// composition).
		container: {
			base: '@max-[40rem]/docs-pane:px-4! @min-[40rem]/docs-pane:px-6! @min-[64rem]/docs-pane:px-8!',
		},
		header: {
			slots: {
				left: '@max-[40rem]/docs-pane:flex-none! @min-[40rem]/docs-pane:flex-1!',
				center: '@max-[40rem]/docs-pane:hidden! @min-[40rem]/docs-pane:flex!',
				right: '@max-[40rem]/docs-pane:flex-none! @min-[40rem]/docs-pane:flex-1!',
				toggle: '@max-[40rem]/docs-pane:flex! @min-[40rem]/docs-pane:hidden!',
				content: '@max-[40rem]/docs-pane:block! @min-[40rem]/docs-pane:hidden!',
				overlay: '@max-[40rem]/docs-pane:block! @min-[40rem]/docs-pane:hidden!',
			},
		},
		contentToc: {
			slots: {
				bottom: '@max-[64rem]/docs-pane:hidden! @min-[64rem]/docs-pane:flex!',
			},
		},

		content: {
			callout: {
				// Fix background color of pre > code blocks
				wrapper: '[&_pre>code]:!bg-transparent',
			},
		},
		contentSurround: {
			slots: {
				root: 'flex flex-col-reverse sm:grid sm:grid-cols-2 gap-8',
			},
		},
		pageHeader: {
			slots: {
				// Counter the default `lg:flex-row lg:items-center lg:justify-between`
				// from Nuxt UI: at narrow pane widths the row should collapse to a
				// stacked column even when the viewport is wide (AI panel open).
				wrapper: '@max-[40rem]/docs-pane:flex-col! @max-[40rem]/docs-pane:items-stretch! @max-[40rem]/docs-pane:justify-start! @min-[40rem]/docs-pane:flex-row! @min-[40rem]/docs-pane:items-center! @min-[40rem]/docs-pane:justify-between!',
				title: 'text-3xl sm:text-4xl text-pretty font-display font-medium text-highlighted',
			},
		},
		prose: {
			h1: {
				base: 'font-display font-medium',
			},
			h2: {
				base: 'font-display font-medium',
			},
			h3: {
				base: 'font-display font-medium',
			},
			h4: {
				base: 'font-display font-medium',
			},
			pre: {
				slots: {
					base: 'text-xs/4',
				},
			},
		},
	},

	header: {
		nav: [
			{
				label: 'Start',
				to: '/getting-started/overview',
			},
			{
				label: 'Guide',
				children: [
					{
						label: 'Data Model',
						to: '/guides/data-model/collections',
						icon: 'directus-explore',
					},
					{
						label: 'Content',
						to: '/guides/content/explore',
						icon: 'directus-editor',
					},
					{
						label: 'Auth',
						to: '/guides/auth/tokens-cookies',
						icon: 'directus-auth',
					},
					{
						label: 'APIs',
						to: '/guides/connect/authentication',
						icon: 'directus-connect',
					},
					{
						label: 'Files',
						to: '/guides/files/upload',
						icon: 'directus-files',
					},
					{
						label: 'Flows',
						to: '/guides/automate/flows',
						icon: 'directus-automate',
					},
					{
						label: 'Insights',
						to: '/guides/insights/overview',
						icon: 'directus-insights',
					},
					{
						label: 'Realtime',
						to: '/guides/realtime/authentication',
						icon: 'directus-realtime',
					},
					{
						label: 'Extensions',
						to: '/guides/extensions/overview',
						icon: 'directus-marketplace',
					},
					{
						label: 'Deployments',
						to: '/guides/deployments',
						icon: 'directus-deployments',
					},
					{
						label: 'Security',
						to: '/guides/security/best-practices',
						icon: 'i-lucide-shield-check',
					},
					{
						label: 'AI',
						to: '/guides/ai/',
						icon: 'directus-ai',
					},
					{
						label: 'Integrations',
						to: '/guides/integrations',
						icon: 'directus-integrations',
					},
				],
			},
			{
				label: 'Hosting',
				children: [
					{
						label: 'Cloud',
						to: '/cloud/getting-started/introduction',
						icon: 'i-lucide-cloud',
					},
					{
						label: 'Self-Hosting',
						to: '/self-hosting/overview',
						icon: 'i-lucide-server',
					},
				],
			},
			{
				label: 'Configuration',
				to: '/configuration/intro',
			},
			{
				label: 'Resources',
				children: [
					{
						label: 'Frameworks',
						to: '/frameworks',
						icon: 'i-lucide-braces',
					},
					{
						label: 'Tutorials',
						to: '/tutorials',
						icon: 'i-lucide-file-text',
					},
					{
						label: 'Community',
						to: '/community/overview/welcome',
						icon: 'i-lucide-heart-handshake',
					},
					{
						label: 'Releases',
						to: '/releases',
						icon: 'i-lucide-book-open',
					},
				],
			},
			{
				label: 'API Reference',
				to: '/api',
			},
		],
		links: [
			{
				icon: 'simple-icons:directus',
				to: 'https://directus.com',
			},
			{
				icon: 'simple-icons:github',
				to: 'https://github.com/directus/directus',
			},
		],
	},

	toc: {
		title: 'On this page',

		// Turn the feedback widget on/off globally
		feedback: true,

		newsletter: {
			hsPortal: 20534155,
			hsForm: 'd57a69e4-6f43-4768-a600-5f7d30306260',
		},

		// Has "edit page" dynamically added in the first position in DocsToc.vue
		links: [
			{
				icon: 'i-lucide-star',
				label: 'Star on GitHub',
				to: 'https://github.com/directus/directus',
			},
		],
	},

	cta: {
		cloud: {
			link: 'https://directus.cloud',
			description:
				'Everything you need to start building. Provisioned in 90 seconds.',
			cta: 'Get Started',
		},
		newsletter: {
			description:
				'Get once-a-month release notes & real‑world code tips...no fluff. 🐰',
			form: {
				hsPortal: 20534155,
				hsForm: 'd57a69e4-6f43-4768-a600-5f7d30306260',
			},
		},
	},

	preFooter: {
		links: [
			{
				icon: 'i-lucide-headset',
				label: 'Need help? Contact Support.',
				to: 'https://directus.com/support',
			},
			{
				icon: 'i-lucide-users',
				label: 'Join our Community Platform.',
				to: 'https://community.directus.com',
			},
			{
				icon: 'i-lucide-rocket',
				label: 'Check out our product changelog.',
				to: '/releases/changelog',
			},
			{
				icon: 'i-lucide-circle-question-mark',
				label: 'Need a license? Contact Sales.',
				to: 'https://directus.com/contact',
			},
		],
	},

	footer: {
		links: [
			{
				label: 'Cloud Policies',
				to: 'https://directus.com/cloud-policies',
			},
			{
				label: 'License',
				to: 'https://directus.com/license',
			},
			{
				label: 'Terms',
				to: 'https://directus.com/terms',
			},
			{
				label: 'Privacy',
				to: 'https://directus.com/privacy',
			},
		],
		socials: [
			{
				icon: 'simple-icons:bluesky',
				to: 'https://bsky.app/profile/directus.io',
			},
			{
				icon: 'simple-icons:x',
				to: 'https://x.com/directus',
			},
			{
				icon: 'simple-icons:discord',
				to: 'https://directus.chat/',
			},
			{
				icon: 'simple-icons:github',
				to: 'https://github.com/directus/directus',
			},
		],
	},
});
