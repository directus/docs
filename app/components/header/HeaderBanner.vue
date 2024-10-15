<script setup lang="ts">
import { readSingleton } from '@directus/sdk';

const message = await useAsyncData('documentation_banner2', async () => {
	return db().request(
		readSingleton('documentation_banner'),
	);
});
</script>

<template>
	<NuxtLink
		v-if="message.data.value?.status == 'published'"
		class="banner"
		:to="message.data.value.link"
	>
		{{ message.data.value?.message }}
		<Icon
			class="icon"
			name="material-symbols:arrow-right-alt-rounded"
		/>
	</NuxtLink>
</template>

<style scoped lang="scss">
.banner {
	background-color: var(--primary);
	padding: 0.25rem 1rem;
	color: white;
	font-size: 0.9rem;
	font-weight: 500;
	width: 100%;
	text-decoration: none;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.icon {
	font-size: 1.25rem;
}
</style>
