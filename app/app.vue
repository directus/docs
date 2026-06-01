<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

const { data: navigation } = await useAsyncData('content-navigation', () => queryCollectionNavigation('content', ['title', 'description', 'icon', 'links']));

provide('navigation', navigation as Ref<ContentNavigationItem[]>);

await useDocsOgImage();
</script>

<template>
	<UApp>
		<NuxtLoadingIndicator color="var(--color-primary)" />
		<div
			id="docs-scroll"
			class="h-screen min-w-0 overflow-y-auto overflow-x-hidden scroll-smooth"
		>
			<DocsShell />
		</div>
	</UApp>
</template>
