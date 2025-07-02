<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

const nav = inject<Ref<ContentNavigationItem[]>>('navigation')!;
const route = useRoute();

const { links } = useSectionLinks();
const { header: { nav: navConfig } } = useAppConfig();

const currentSection = computed(() => {
	// Get the first segment of the path to determine the content section
	const pathSegments = route.path.split('/').filter(Boolean);
	const contentSection = pathSegments[0]; // e.g., "cloud", "guides", "api"

	if (!contentSection) return null;

	// Don't show section header for guides since they're already in the navigation
	if (contentSection === 'guides') return null;

	// Find the nav section that contains a child matching this content section
	for (const item of navConfig) {
		if (item.children) {
			const matchingChild = item.children.find((child) => {
				if (child.to) {
					const childSegments = child.to.split('/').filter(Boolean);
					return childSegments[0] === contentSection;
				}
				return false;
			});
			if (matchingChild) {
				return matchingChild; // Return the specific child (e.g., "Cloud", "Self-Hosting")
			}
		}

		// For direct matches (like API Reference, Start)
		if (item.to) {
			const itemSegments = item.to.split('/').filter(Boolean);
			if (itemSegments[0] === contentSection) {
				return item;
			}
		}
	}

	return null;
}) as ComputedRef<{ label: string; to: string; icon?: string } | null>;

// Only render the nav for the current section of the docs (eg docs, api, cloud)
const navigation = computed(() => {
	const routePrefix = `/${route.path.split('/')[1]}`;

	return nav.value.find((item) => {
		return item.path.startsWith(routePrefix);
	})?.children ?? [];
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
					<p
						v-if="currentSection"
						class="text-xs font-medium text-dimmed mb-2 uppercase flex items-center gap-1"
					>
						<Icon
							v-if="currentSection?.icon"
							:name="currentSection.icon"
						/>
						{{ currentSection.label }}
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
