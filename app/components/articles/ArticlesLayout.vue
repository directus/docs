<script setup lang="ts">
defineProps<{
	title: string;
	categories: ArticleNavItems;
	articles: ArticleNavItems;
	tags: ArticleTags;
}>();
</script>

<template>
	<div class="page">
		<main
			class="main-content"
		>
			<h1>
				{{ title }}
			</h1>

			<div class="flex-row">
				<div
					class="main-content"
					style="flex-grow: 1;"
				>
					<ArticlesCategoryNav :categories="categories" />
					<ArticlesGrid
						:articles="articles"
					/>
				</div>

				<aside class="right-aside">
					<ArticlesTagsFilter :tags="tags" />
				</aside>
			</div>
		</main>
	</div>
</template>

<style scoped lang="scss">
.page {
	padding: 1.5rem;
}

.right-aside {
	margin-left: 1rem;
	padding-left: 2rem;
	padding-right: 1em;
	border-left: 2px solid var(--border);
	display: flex;
	flex-direction: column;
	gap: calc(24px / 2);
	white-space: nowrap;
}

.right-aside > * {
	width: 100%;
}

@media (max-width: 1024px) {
	.right-aside {
		display: none;
	}
}

.flex-row {
	display: flex;
	gap: 1rem;
	align-items: flex-start;
}

.main-content {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 1rem;
	width: 100%;
}
</style>
