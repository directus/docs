export default defineAppConfig({
	ui: {
		primary: 'purple', // Tailwind color name
	},

	header: {
		nav: [
			{
				label: 'Start',
				to: '/getting-started',
			},
			{
				label: 'Build',
				children: [
					{
						label: 'Auth',
						to: '/guides/auth/quickstart',
						icon: 'directus-auth',
					},
					{
						label: 'Data Model',
						to: '/guides/data-model/quickstart',
						icon: 'directus-connect',
					},
					{
						label: 'Content',
						to: '/guides/content/explore',
						icon: 'directus-explore',
					},
					{
						label: 'Extensions',
						to: '/extensions/overview',
						icon: 'directus-marketplace',
					},
					{
						label: 'Files',
						to: '/guides/files/quickstart',
						icon: 'directus-files',
					},
					{
						label: 'Automations',
						to: '/guides/automations/quickstart',
						icon: 'directus-automate',
					},
					{
						label: 'Insights',
						to: '/guides/insights/quickstart',
						icon: 'directus-insights',
					},
					{
						label: 'Realtime',
						to: '/guides/realtime/quickstart',
						icon: 'directus-realtime',
					},
				],
			},
			{
				label: 'Manage',
				children: [
					{
						label: 'Cloud',
						to: '/cloud/getting-started/introduction',
						icon: 'i-ph-cloud',
						// description: 'Connect Directus with your favorite framework.',
					},
					{
						label: 'Self Hosting',
						to: '/self-hosting/overview',
						icon: 'i-ph-hard-drives',
						// description: 'Content Management.',
					},
					{
						label: 'Configuration',
						to: '/configuration/general',
						icon: 'i-ph-gear',
						// description: 'Content Management.',
					},
				],
			},
			{
				label: 'Resources',
				children: [
					{
						label: 'Community',
						to: '/community',
						icon: 'i-ph-hand-heart',
						// description: 'Connect Directus with your favorite framework.',
					},
					{
						label: 'Releases',
						to: '/releases',
						icon: 'i-ph-notebook',
						// description: 'Content Management.',
					},
					{
						label: 'Tutorials',
						to: '/tutorials',
						icon: 'i-ph-article',
						// description: 'Content Management.',
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
