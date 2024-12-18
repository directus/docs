<script setup lang="ts">
import type { NavItem } from '@nuxt/content';

const nav = inject<Ref<NavItem[]>>('navigation')!;
const route = useRoute();

// Only render the nav for the current section of the docs (eg docs, api, cloud)
const navigation = computed(() => {
	const routePrefix = '/' + route.path.split('/')[1]!;

	return nav.value.find((item) => {
		return item._path.startsWith(routePrefix);
	})?.children ?? [];
});

definePageMeta({
	layout: 'empty',
});
</script>

<template>
	<UContainer>
		<UPage>
			<template #left>
				<UAside>
					<UNavigationTree
						:links="mapContentNavigation(navigation)"
						:multiple="false"
						default-open
					/>
				</UAside>
			</template>

			<NuxtPage :page-key="route => route.fullPath" />
		</UPage>
	</UContainer>
</template>
