<script setup lang="ts">
const props = defineProps<{
	product: keyof typeof linkMap;
}>();

const name = computed(
	() => props.product.charAt(0).toUpperCase() + props.product.slice(1),
);

const linkMap = {
	'auth': '/guides/auth/quickstart',
	'automate': '/guides/automate/quickstart',
	'content': '/guides/content/explore',
	'data-model': '/guides/data-model/quickstart',
	'extensions': '/guides/extensions/overview',
	'files': '/guides/files/quickstart',
	'insights': '/guides/insights/overview',
	'realtime': '/guides/realtime/quickstart',
} as const;
</script>

<template>
	<UButton
		color="white"
		size="xs"
		:to="linkMap[product]"
		:icon="`directus:${product}`"
		:label="name"
		class="text-primary align-middle"
	/>
</template>
