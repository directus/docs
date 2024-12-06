<script setup lang="ts">
withDefaults(
	defineProps<{
		uuid: string;
		alt: string;
		width?: string | number;
		height?: string | number;
	}>(),
	{
		width: 1280,
	},
);
</script>

<template>
	<img
		:src="`https://product-team.directus.app/assets/${uuid}`"
		:alt="alt"
		:width="width"
		:height="height"
		format="auto"
		loading="lazy"
	>
</template>
