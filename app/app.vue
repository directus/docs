<script setup lang="ts">
import { spec } from '@directus/openapi';
import { onMounted } from 'vue';

const { data: navigation } = useAsyncData('navigation', () => fetchContentNavigation());

provide('openapi', spec);
provide('navigation', navigation);

defineOgImage({
	url: '/img/og-image.png',
});

const { search } = useAppConfig();

const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', { default: () => [], server: false });
onMounted(() => {
	const links = document.querySelectorAll('a');
	links.forEach(link => {
		if (link.hostname !== window.location.hostname) {
			link.setAttribute('target', '_blank');
		}
	});
});
</script>

<template>
	<div>
		<DocsHeader />

		<UMain>
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</UMain>

		<DocsFooter />

		<ClientOnly v-if="search.backend === 'nuxt'">
			<LazyUContentSearch
				ref="searchRef"
				:files="files"
				:navigation="navigation"
				:fuse="{ resultLimit: 42 }"
			/>
		</ClientOnly>
	</div>
</template>
