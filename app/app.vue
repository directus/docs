<script setup lang="ts">
import { spec } from '@directus/openapi';
import type { ContentNavigationItem } from '@nuxt/content';

const { data: navigation } = useAsyncData('content-navigation', () => queryCollectionNavigation('content', ['title', 'description', 'icon', 'links']));

provide('openapi', spec);
provide('navigation', navigation as Ref<ContentNavigationItem[]>);

defineOgImage({
	url: '/img/og-image.png',
});
</script>

<template>
	<UApp>
		<NuxtLoadingIndicator color="var(--color-primary)" />
		<DocsHeader />
		<UMain>
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</UMain>
		<DocsFooter />
	</UApp>
</template>
