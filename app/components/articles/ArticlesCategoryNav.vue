<script setup lang="ts">
const route = useRoute();
defineProps<{
	categories: ArticleNavItems;
}>();
</script>

<template>
	<div class="wrapper">
		<div class="category-row">
			<NuxtLink
				v-for="category in categories"
				:key="category._path"
				:to="{ path: category._path, query: {} }"
				class="category-nav-item"
				active-class="active"
			>
				{{ category.title }}
			</NuxtLink>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.wrapper {
	overflow-x: auto;
}

.category-row {
	display: flex;
	justify-content: start;
	gap: 1rem;
}

.category-nav-item {
	border-radius: var(--border-radius);
	font-weight: 500;
	font-size: 1rem;
	padding: 0.25rem 0.75rem;
	background-color: var(--background-subdued);
	text-decoration: none;
	white-space: nowrap;
}

.category-nav-item:hover {
	background-color: var(--background-subtle);
}

.category-nav-item.active {
	background: var(--primary);
	color: white;
	border-color: var(--primary);
	&:hover {
		background: var(--primary);
	}
}
</style>
