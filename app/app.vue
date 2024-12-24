<script setup lang="ts">
import { spec } from '@directus/openapi';

const { data: navigation } = useAsyncData('navigation', () => fetchContentNavigation());

provide('openapi', spec);
provide('navigation', navigation);

defineOgImage({
	url: '/img/og-image.png',
});

const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', { default: () => [], server: false });
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

		<ClientOnly>
			<LazyUContentSearch
				ref="searchRef"
				:files="files"
				:navigation="navigation"
				:fuse="{ resultLimit: 42 }"
			/>
		</ClientOnly>
	</div>
</template>
