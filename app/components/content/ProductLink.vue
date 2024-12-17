<script setup lang="ts">
const props = defineProps<{
	product: string;
}>();

const name = computed(
	() => props.product.charAt(0).toUpperCase() + props.product.slice(1),
);
</script>

<template>
	<UButton
		color="white"
		size="xs"
		:to="`/docs/${product}`"
		:icon="`directus:${product}`"
		:label="name"
		class="text-primary align-middle"
	/>
</template>
