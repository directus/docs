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
				label: 'Guides',
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
						to: '/guides/extensions/overview',
						icon: 'directus-marketplace',
					},
					{
						label: 'Files',
						to: '/guides/files/quickstart',
						icon: 'directus-files',
					},
					{
						label: 'Automate',
						to: '/guides/automate/quickstart',
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
					},
					{
						label: 'Self Hosting',
						to: '/self-hosting/overview',
						icon: 'i-ph-hard-drives',
					},
					{
						label: 'Configuration',
						to: '/configuration/general',
						icon: 'i-ph-gear',
					},
				],
			},
			{
				label: 'Resources',
				children: [
					{
						label: 'Community',
						to: '/community/overview/welcome',
						icon: 'i-ph-hand-heart',
					},
					{
						label: 'Releases',
						to: '/releases',
						icon: 'i-ph-notebook',
					},
					{
						label: 'Tutorials',
						to: '/tutorials',
						icon: 'i-ph-article',
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

		// Turn the feedback widget on/off globally
		feedback: true,

		// Turn the newsletter signup on/off globally
		newsletter: true,

		// Has "edit page" dynamically added in the first position in DocsTocAuthors.vue
		links: [
			{
				icon: 'material-symbols:star-rate-outline-rounded',
				label: 'Star on GitHub',
				to: 'https://github.com/directus/directus',
			},
		],
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
