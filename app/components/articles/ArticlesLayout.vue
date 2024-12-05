<script setup lang="ts">
defineProps<{
	title: string;
	categories: ArticleNavItems;
	articles: ArticleNavItems;
	tags: ArticleTags;
}>();
</script>

<template>
	<div class="page container">
		<main class="main-content">
			<h1>
				{{ title }}
			</h1>

			<div class="flex-row">
				<div class="article-grid-area">
					<ArticlesCategoryNav :categories="categories" />
					<ArticlesGrid :articles="articles" />
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
	margin-top: 24px;
	padding-left: 1.5rem;
	padding-right: 1.5rem;
	padding-top: 1.5rem;
}

.right-aside {
	padding-left: 2rem;
	padding-right: 1em;
	display: flex;
	flex-direction: column;
	gap: 12px;
	white-space: nowrap;
	flex: 0 0 auto;
	width: auto;
	height: 100%;
}

.right-aside > * {
	width: 100%;
}

@media (min-width: 1024px) {
	.article-grid-area {
		border-right: 2px solid var(--border);
		padding-right: 2rem;
	}
}

@media (max-width: 1024px) {
	.right-aside {
		display: none;
	}
}

.flex-row {
	display: flex;
	position: relative;
}

.article-grid-area {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 1rem;
	width: 100%;
	padding-bottom: 4rem;
	overflow: hidden;
	flex: 1;
}
</style>
