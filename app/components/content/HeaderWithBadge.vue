<script setup lang="ts">
defineProps<{
	text: string;
	badge: string;
	h: string;
}>();

function slugify(str: string) {
	str = str.replace(/^\s+|\s+$/g, '');
	str = str.toLowerCase();

	str = str.replace(/[^a-z0-9 -]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

	return str;
}
</script>

<template>
	<component
		:is="`h${h}`"
		:id="`#${slugify(text)}`"
		class="header-with-badge"
	>
		<a :href="`#${slugify(text)}`">
			<span>{{ text }}</span>
			<Badge
				:text="badge"
				color="primary"
				small
			/>
		</a>
	</component>
</template>

<style scoped>
a {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}
</style>
