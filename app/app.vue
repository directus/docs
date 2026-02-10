<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import { spec } from '@directus/openapi';

const { data: navigation } = useAsyncData('content-navigation', () => queryCollectionNavigation('content', ['title', 'description', 'icon', 'links']));

provide('openapi', spec);
provide('navigation', navigation as Ref<ContentNavigationItem[]>);

defineOgImage({
	url: '/og-image.png',
});
</script>

<template>
	<UApp>
		<NuxtLoadingIndicator color="var(--color-primary)" />
		<DocsBanner />
		<DocsHeader />
		<UMain>
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</UMain>
		<DocsFooter />
	</UApp>
</template>
