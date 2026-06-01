<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import { docsSections } from '#shared/utils/docsSections';

const nav = inject<Ref<ContentNavigationItem[] | null>>('navigation')!;
const route = useRoute();

const section = docsSections.find(s => s.id === 'tutorials')!;

const navigation = computed(() => {
	const routePrefix = `/${route.path.split('/')[1]}`;

	return nav.value?.find(item => item.path?.startsWith(routePrefix))?.children ?? [];
});
</script>

<template>
	<UContainer>
		<DocsPage>
			<template #left>
				<DocsAside class="lg:ps-0 lg:-ms-0 lg:pe-2">
					<p class="text-xs font-medium text-dimmed mb-2 uppercase font-mono tracking-widest flex items-center gap-1">
						<Icon
							v-if="section.icon"
							:name="section.icon"
						/>
						{{ section.label }}
					</p>
					<UContentNavigation
						:navigation="navigation"
						default-open
						variant="link"
						highlight
					/>
				</DocsAside>
			</template>

			<slot />
		</DocsPage>
	</UContainer>
</template>
