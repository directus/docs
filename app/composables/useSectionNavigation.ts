import type { ContentNavigationItem } from '@nuxt/content';
import {
	docsGroups,
	docsSections,
	findGroupBySectionId,
	findSectionByPath,
	matchesPrefix,
	type DocsGroup,
	type DocsSection,
} from '#shared/utils/docsSections';

export function useSectionNavigation(options: { immediate?: boolean } = {}) {
	const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')!;
	const route = useRoute();
	const router = useRouter();
	const routePath = computed(() => options.immediate ? router.currentRoute.value.path : route.path);

	const currentSection = computed<DocsSection | null>(() =>
		findSectionByPath(routePath.value),
	);

	const currentGroup = computed<DocsGroup | null>(() => {
		if (currentSection.value) return findGroupBySectionId(currentSection.value.id);
		// Treat the home route as part of the primary docs group so the
		// section subnav and sidebar render with default content.
		if (routePath.value === '/') return docsGroups.find(group => group.id === 'docs') ?? null;
		return null;
	});

	const groups = computed(() =>
		docsGroups.map(group => ({
			...group,
			active: currentGroup.value?.id === group.id,
		})),
	);

	const sections = computed(() =>
		docsSections.map(section => ({
			...section,
			active: section.prefixes.some(prefix => matchesPrefix(routePath.value, prefix)),
		})),
	);

	const groupSections = computed(() => {
		const group = currentGroup.value;
		if (!group) return [];
		return group.sectionIds
			.map(id => sections.value.find(section => section.id === id))
			.filter((section): section is typeof sections.value[number] => Boolean(section));
	});

	const findRoot = (prefix: string) =>
		navigation.value?.find(item => item.path === prefix || item.path.startsWith(`${prefix}/`)) ?? null;

	const collapseDescendants = (item: ContentNavigationItem): ContentNavigationItem => ({
		...item,
		defaultOpen: false,
		children: item.children?.map(collapseDescendants),
	});

	const getSectionTopLevel = (section: DocsSection) => {
		const topLevel = section.id === 'deploy'
			? section.prefixes
				.map(findRoot)
				.filter((item): item is ContentNavigationItem => item !== null)
			: findRoot(section.prefixes[0]!)?.children ?? [];

		return section.id === 'releases'
			? topLevel.filter(item => item.path !== section.to)
			: topLevel;
	};

	const sectionNavigation = computed<ContentNavigationItem[]>(() => {
		const section = currentSection.value;
		if (!section) return [];

		const topLevel = getSectionTopLevel(section);

		return topLevel.map(item => ({
			...item,
			children: item.children?.map(collapseDescendants),
		}));
	});

	const containsActivePath = (item: ContentNavigationItem): boolean => {
		if (item.path === routePath.value) return true;
		return item.children?.some(containsActivePath) ?? false;
	};

	const openActiveAncestors = (item: ContentNavigationItem): ContentNavigationItem => {
		const onActivePath = containsActivePath(item);
		return {
			...item,
			defaultOpen: onActivePath,
			children: item.children?.map(openActiveAncestors),
		};
	};

	const mobileSectionNavigation = computed<ContentNavigationItem[]>(() =>
		sectionNavigation.value.map(openActiveAncestors),
	);

	const mobileNavigationTree = computed<ContentNavigationItem[]>(() => {
		if (currentGroup.value?.id === 'docs') {
			return groupSections.value.flatMap((section) => {
				const topLevel = getSectionTopLevel(section);
				const items = topLevel.map(item => ({
					...item,
					children: item.children?.map(collapseDescendants),
				})).map(openActiveAncestors);
				if (!items.length) return [];
				return [
					{ title: section.label, icon: section.icon, isGroupLabel: true } as ContentNavigationItem,
					...items,
				];
			});
		}

		return mobileSectionNavigation.value;
	});

	const allSectionItems = computed(() => {
		const items = groups.value.flatMap((group) => {
			const gs = group.sectionIds
				.map(id => sections.value.find(s => s.id === id))
				.filter((s): s is typeof sections.value[number] => Boolean(s));
			const groupLink = { title: group.label, to: group.to, path: group.to, icon: group.icon, active: group.active };
			if (gs.length <= 1) return [groupLink];
			return [groupLink, ...gs.map(s => ({ title: s.label, to: s.to, path: s.to, icon: s.icon, active: s.active, indent: true }))];
		});
		return items;
	});

	return {
		groups,
		currentGroup,
		sections,
		currentSection,
		groupSections,
		sectionNavigation,
		mobileSectionNavigation,
		mobileNavigationTree,
		allSectionItems,
	};
}
