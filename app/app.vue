<script setup lang="ts">
const { data: navigation } = useAsyncData('navigation', () => fetchContentNavigation());

console.log(navigation);
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
	</div>
</template>

<style scoped>
/* Your component styles go here */
</style>