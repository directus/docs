<script setup lang="ts">
import { spec } from '@directus/openapi';
import type { ParsedContent } from '@nuxt/content';

const { data: navigation } = useAsyncData('navigation', () => fetchContentNavigation());
const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', { default: () => [], server: false });

provide('openapi', spec);
provide('navigation', navigation);
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
				:files="files"
				:navigation="navigation"
				:links="[]"
			/>
		</ClientOnly>
	</div>
</template>
