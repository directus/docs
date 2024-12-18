export default defineAppConfig({
	ui: {
		primary: 'purple', // Tailwind color name
	},

	header: {
		nav: [
			{
				label: 'Start',
				children: [
					{
						label: 'Getting Started',
						to: '/getting-started/create-a-project',
						icon: 'i-ph-play',
						description: 'Learn about how to create a Directus project.',
					},
					{
						label: 'Framework Quickstarts',
						to: '/getting-started/frameworks',
						icon: 'i-ph-plugs-connected',
						description: 'Connect Directus with your favorite framework.',
					},
				],
			},
			{
				label: 'Compose',
				children: [
					{
						label: 'Auth',
						to: '/guides/auth/quickstart',
						icon: 'directus-auth',
						description: 'Connect Directus with your favorite framework.',
					},
					{
						label: 'Content',
						to: '/guides/content/explore',
						icon: 'directus-explore',
						description: 'Content Management.',
					},
					{
						label: 'Files',
						to: '/guides/files/quickstart',
						icon: 'directus-files',
						description: 'Connect Directus with your favorite framework.',
					},
					{
						label: 'Insights',
						to: '/guides/insights/quickstart',
						icon: 'directus-insights',
						description: 'Connect Directus with your favorite framework.',
					},
				],
			},
			{
				label: 'Build',
				children: [
					{
						label: 'Automate',
						to: '/engine/automate/quickstart',
						icon: 'directus-automate',
						description: 'Connect Directus with your favorite framework.',
					},
					{
						label: 'Connect',
						to: '/engine/connect/quickstart',
						icon: 'directus-connect',
						description: 'Content Management.',
					},
					{
						label: 'Extend',
						to: '/engine/extensions/overview',
						icon: 'directus-marketplace',
						description: 'Connect Directus with your favorite framework.',
					},
					{
						label: 'Realtime',
						to: '/engine/realtime/quickstart',
						icon: 'directus-realtime',
						description: 'Connect Directus with your favorite framework.',
					},
				],
			},
			{
				label: 'Manage',
				children: [
					{
						label: 'Cloud',
						to: '/cloud/getting-started/introduction',
						icon: 'directus-automate',
						description: 'Connect Directus with your favorite framework.',
					},
					{
						label: 'Self Hosting',
						to: '/self-hosting/overview',
						icon: 'directus-connect',
						description: 'Content Management.',
					},
				],
			},
			{
				label: 'Resources',
				children: [
					{
						label: 'API',
						to: '/api',
						icon: 'directus-automate',
						description: 'Connect Directus with your favorite framework.',
					},
					{
						label: 'Community',
						to: '/community',
						icon: 'directus-connect',
						description: 'Content Management.',
					},
					{
						label: 'Tutorials',
						to: '/tutorials',
						icon: 'directus-connect',
						description: 'Content Management.',
					},
					{
						label: 'Releases',
						to: '/releases',
						icon: 'directus-connect',
						description: 'Content Management.',
					},
				],
			},
		],
		links: [
			{
				'icon': 'i-simple-icons-github',
				'to': 'https://github.com/directus/directus',
				'aria-label': 'Directus on GitHub',
			},
		],
	},

	toc: {
		title: 'On this page',
	},

	cta: {
		cloud: {
			link: 'https://directus.cloud',
			description: 'Everything you need to start building. Provisioned in 90 seconds.',
			cta: 'Get Started',
		},
	},

	footer: {
		links: [
			{
				label: 'Cloud Policies',
				to: 'https://directus.io/cloud-policies',
			},
			{
				label: 'License',
				to: 'https://directus.io/bsl',
			},
			{
				label: 'Terms',
				to: 'https://directus.io/terms',
			},
			{
				label: 'Privacy',
				to: 'https://directus.io/privacy',
			},
		],
		socials: [
			{
				icon: 'i-simple-icons-bluesky',
				to: 'https://bsky.app/profile/directus.io',
			},
			{
				icon: 'i-simple-icons-x',
				to: 'https://x.com/directus',
			},
			{
				icon: 'i-simple-icons-discord',
				to: 'https://directus.chat/',
			},
			{
				icon: 'i-simple-icons-github',
				to: 'https://github.com/directus/directus',
			},
		],
	},
});
