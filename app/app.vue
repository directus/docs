<script setup lang="ts">
import { spec } from '@directus/openapi';

provide('openapi', spec);

const { data: navigation } = useAsyncData('navigation', () => fetchContentNavigation());
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
	</div>
</template>
