export default defineAppConfig({
	ui: {
		primary: 'purple' // Tailwind color name
	},

	header: {
		nav: [
			{
				label: 'Docs',
				to: '/docs/getting-started',
			},
			{
				label: 'API',
				to: '/api',
			},
			{
				label: 'Cloud',
				to: '/cloud/getting-started/introduction',
			},
			{
				label: 'Tutorials',
				to: '/tutorials',
			},
			{
				label: 'Community',
				to: '/community',
			},
		],
		links: [
			{
				icon: 'i-simple-icons-github',
				to: 'https://github.com/directus/directus',
				'aria-label': 'Directus on GitHub',
			}
		],
	},

	toc: {
		title: "On this page",
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
				to: 'https://directus.io/cloud-policies'
			},
			{
				label: 'License',
				to: 'https://directus.io/bsl'
			},
			{
				label: 'Terms',
				to: 'https://directus.io/terms'
			},
			{
				label: 'Privacy',
				to: 'https://directus.io/privacy'
			}
		],
		socials: [
			{
				icon: 'i-simple-icons-bluesky',
				to: 'https://bsky.app/profile/directus.io'
			},
			{
				icon: 'i-simple-icons-x',
				to: 'https://x.com/directus'
			},
			{
				icon: 'i-simple-icons-discord',
				to: 'https://directus.chat/'
			},
			{
				icon: 'i-simple-icons-github',
				to: 'https://github.com/directus/directus'
			}
		]
	},
});
