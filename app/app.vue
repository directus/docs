<script setup lang="ts">
import { spec } from '@directus/openapi';

const { data: navigation } = useAsyncData('navigation', () => fetchContentNavigation());

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
	</div>
</template>
