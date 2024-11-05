<script lang="ts" setup>
defineProps<{
	articles: ArticleNavItems;
}>();
</script>

<template>
	<div
		v-if="articles.length > 0"
		class="grid"
	>
		<ArticlesCard
			v-for="article in articles"
			:key="article._path"
			:article="article"
		/>
	</div>
	<div v-else>
		<p>No articles matching your filters.</p>
	</div>
</template>

<style lang="scss" scoped>
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1rem;
}
</style>
