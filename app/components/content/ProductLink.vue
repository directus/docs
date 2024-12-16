<script setup lang="ts">
const props = defineProps<{
	product: string;
}>();

const name = computed(
	() => props.product.charAt(0).toUpperCase() + props.product.slice(1)
);
</script>

<template>
	<UButton
		color="gray"
		size="xs"
		:to="`/${product}`"
		:icon="`directus:${product}`"
		:label="name"
		class="text-primary"
	/>
</template>
