<script setup lang="ts">
import type { NavItem } from '@nuxt/content';

const navigation = inject<NavItem[]>('navigation', []);

const { header } = useAppConfig();
</script>

<template>
	<UHeader>
		<template #logo>
			<UColorModeImage />
		</template>
	</UHeader>
</template>

<style scoped>
/* Your component styles go here */
</style>
