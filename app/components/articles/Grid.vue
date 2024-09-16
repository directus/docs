<script lang="ts" setup>
defineProps<{
	articles: {
		_path: string;
		title: string;
		category: string;
		tags: {
			id: string;
			icon: string;
			name: string;
		}[];
	}[];
}>();
</script>

<template>
	<div v-if="articles.length > 0" class="card-grid">
		<ArticlesCard
			v-for="article in articles"
			:key="article._path"
			v-bind="article"
		/>
	</div>
	<div v-else>
		<p>No articles matching your filters.</p>
	</div>
</template>

<style lang="scss" scoped>
.card-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1rem;
}
</style>
