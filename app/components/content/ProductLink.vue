<script setup lang="ts">
const props = defineProps<{
	product: keyof typeof linkMap;
}>();

const name = computed(
	() => props.product.charAt(0).toUpperCase() + props.product.slice(1),
);

const linkMap = {
	'auth': '/guides/auth/tokens-cookies',
	'automate': '/guides/automate/flows',
	'content': '/guides/content/explore',
	'connect': '/guides/connect/authentication',
	'data-model': '/guides/data-model/collections',
	'editor': '/guides/content/edior',
	'explore': '/guides/content/explore',
	'extensions': '/guides/extensions/overview',
	'files': '/guides/files/upload',
	'insights': '/guides/insights/overview',
	'realtime': '/guides/realtime/subscriptions',
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
