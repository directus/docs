export default function useSectionLinks() {
	const route = useRoute();

	const links = computed(() => {
		const sectionLinks = [
			{
				label: 'Get Started',
				href: '/getting-started/overview',
				icon: 'material-symbols:rocket-outline',
				active: route.path.startsWith('/getting-started'),
			},
			{
				label: 'Guides',
				href: '/guides/data-model/collections',
				icon: 'material-symbols:book-outline',
				active: route.path.startsWith('/guides'),
			},
			{
				label: 'Tutorials',
				href: '/tutorials',
				icon: 'material-symbols:school-outline',
				active: route.path.startsWith('/tutorials'),
			},
			{
				label: 'API Reference',
				href: '/api',
				icon: 'material-symbols:code',
				active: route.path.startsWith('/api'),
			},
			{
				label: 'Licensing',
				href: '/licensing/overview',
				icon: 'material-symbols:key-outline',
				active: route.path.startsWith('/licensing'),
			},
		];

		return sectionLinks;
	});

	return { links };
}
