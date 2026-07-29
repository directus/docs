export default function useSectionLinks() {
	const route = useRoute();

	const links = computed(() => {
		const sectionLinks = [
			{
				label: 'Get Started',
				href: '/getting-started/overview',
				icon: 'i-lucide-rocket',
				active: route.path.startsWith('/getting-started'),
			},
			{
				label: 'Guides',
				href: '/guides/data-model/collections',
				icon: 'i-lucide-book-open',
				active: route.path.startsWith('/guides'),
			},
			{
				label: 'Tutorials',
				href: '/tutorials',
				icon: 'i-lucide-graduation-cap',
				active: route.path.startsWith('/tutorials'),
			},
			{
				label: 'API Reference',
				href: '/api',
				icon: 'i-lucide-code',
				active: route.path.startsWith('/api'),
			},
			{
				label: 'Licensing',
				href: '/licensing/overview',
				icon: 'i-lucide-key-round',
				active: route.path.startsWith('/licensing'),
			},
		];

		return sectionLinks;
	});

	return { links };
}
