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
						label: 'Connect',
						to: '/guides/auth/authentication',
						icon: 'directus-connect',
					},
					{
						label: 'Files',
						to: '/guides/files/upload',
						icon: 'directus-files',
					},
					{
						label: 'Automate',
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
						label: 'Self-Hosting',
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

	preFooter: {
		links: [
			{
				icon: 'ic:baseline-support',
				label: 'Need help? Contact Support.',
				to: 'https://directus.io/support',
			},
			{
				icon: 'ic:baseline-discord',
				label: 'Join our Discord community.',
				to: 'https://directus.chat',
			},
			{
				icon: 'ic:baseline-rocket-launch',
				label: 'Check out our product changelog.',
				to: '/releases/changelog',
			},
			{
				icon: 'ic:outline-help-outline',
				label: 'Need a license? Contact Sales.',
				to: 'https://directus.io/demo',
			},
		],
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
