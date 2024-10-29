<script setup lang="ts">
import { readItems } from '@directus/sdk';

const message = await useAsyncData('documentation_banner2', async () => {
	return db().request(readItems('documentation_banner'));
});
</script>

<template>
	<NuxtLink
		v-if="message.data.value && message.data.value?.length > 0"
		class="banner"
		:to="message.data.value[0]?.link"
	>
		<div class="banner-container">
			{{ message.data.value[0]?.message }}
			<Icon
				class="icon"
				name="material-symbols:arrow-right-alt-rounded"
			/>
		</div>
	</NuxtLink>
</template>

<style scoped lang="scss">
.banner {
	background-color: var(--primary);
	padding: 0.25rem 0rem;
	color: white;
	font-size: 0.9rem;
	font-weight: 500;
	width: 100%;
	text-decoration: none;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.banner-container {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	max-width: var(--width-2xl);
	width: 100%;
	padding: 0px 24px;
	margin-left: auto;
	margin-right: auto;
}

.icon {
	font-size: 1.25rem;
}
</style>
