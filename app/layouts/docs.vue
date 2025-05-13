<script setup lang="ts">
import type { NavItem } from '@nuxt/content';
import useSectionLinks from '~/composables/useSectionLinks';

const nav = inject<Ref<NavItem[]>>('navigation')!;
const route = useRoute();

const { links } = useSectionLinks();

// Only render the nav for the current section of the docs (eg docs, api, cloud)
const navigation = computed(() => {
	const routePrefix = '/' + route.path.split('/')[1]!;

	return nav.value.find((item) => {
		return item._path.startsWith(routePrefix);
	})?.children ?? [];
});
</script>

<template>
	<UContainer>
		<UPage>
			<template #left>
				<UAside>
					<UPageAnchors :links="links" />
					<USeparator
						type="dashed"
						class="my-5"
					/>

					<UContentNavigation
						:navigation="navigation"
						default-open
					/>
				</UAside>
			</template>

			<slot />
		</UPage>
	</UContainer>
</template>
