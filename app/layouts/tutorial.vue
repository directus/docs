<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

const nav = inject<Ref<ContentNavigationItem[]>>('navigation')!;
const route = useRoute();

const { links } = useSectionLinks();

// Only render the nav for the current section of the docs (eg docs, api, cloud)
const navigation = computed(() => {
	const routePrefix = `/${route.path.split('/')[1]}`;

	const sectionNav = nav.value.find((item) => {
		return item.path.startsWith(routePrefix);
	})?.children ?? [];

	// Filter to only show category index pages, not individual tutorials
	return sectionNav.filter((item: ContentNavigationItem) => {
		// Only show items that are category index pages (not individual tutorial files)
		// Category paths look like: /tutorials/getting-started, /tutorials/projects, etc.
		// Individual tutorial paths look like: /tutorials/getting-started/some-tutorial-name
		const pathSegments = item.path?.split('/').filter(Boolean) || [];
		return pathSegments.length === 2 && pathSegments[0] === 'tutorials';
	}).map((item: ContentNavigationItem) => {
		// Remove the children array to prevent showing individual tutorials
		return {
			...item,
			children: undefined,
		};
	});
});
</script>

<template>
	<UContainer>
		<UPage>
			<template #left>
				<UPageAside>
					<UPageAnchors :links="links" />
					<USeparator
						type="dashed"
						class="my-5"
					/>
					<p class="text-xs font-medium text-dimmed mb-2 uppercase">
						Hop To
					</p>
					<UContentNavigation
						:navigation="navigation"
						default-open
						variant="link"
						highlight
					/>
				</UPageAside>
			</template>

			<slot />
		</UPage>
	</UContainer>
</template>
