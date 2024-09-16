<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content';

const props = defineProps<{
	data: ParsedContent;
}>();

const { data: navigation } = await useAsyncData(
	'navigation' + props.data._path,
	() =>
		fetchContentNavigation(
			queryContent({
				where: {
					_path: { $contains: props.data._path },
				},
			}),
		),
);

const area = computed(() => {
	if (!navigation.value) return null;
	return {
		title: navigation.value[0]?.title,
		_path: navigation.value[0]?._path,
		children: navigation.value[0]?.children,
	};
});

const categories = computed(() => {
	if (!area.value) return null;
	return [
		{
			title: 'All',
			_path: props.data._path,
		},
		...area.value.children,
	];
});

const allArticlesFlattened = computed(() => {
	if (!categories.value) return null;
	const articles = [];

	for (const category of categories.value) {
		articles.push(
			...(category.children?.map(article => ({
				...article,
				category: category.title,
			})) || []),
		);
	}
	return articles;
});

const allTags = computed(() => {
	if (!allArticlesFlattened.value) return null;
	const tags = new Set();
	for (const article of allArticlesFlattened.value) {
		if (article.tags) {
			for (const tag of article.tags) {
				tags.add(tag);
			}
		}
	}
	return Array.from(tags);
});

const { selectedTags } = useTags();

const filteredArticles = computed(() => {
	if (!selectedTags.value.length || !allArticlesFlattened.value || selectedTags.value.length == 0) return allArticlesFlattened.value;
	return allArticlesFlattened.value.filter(article =>
		article.tags.some(tag => selectedTags.value.includes(tag.id)),
	);
});
</script>

<template>
	<div class="testing">
		<main
			v-if="data"
			class="main-content"
		>
			<h1>
				{{ area?.title }}
			</h1>

			<div class="flex-row">
				<div
					class="main-content"
					style="flex-grow: 1;"
				>
					<ArticlesCategoryRow :categories="categories" />
					<ArticlesGrid
						:articles="filteredArticles"
					/>
				</div>

				<div>
					<ArticlesTags :all-tags="allTags" />
				</div>
			</div>
		</main>
	</div>
</template>

<style lang="scss" scoped>
.testing {
	padding: 1.5rem;
}

.tag {
	display: flex;
	align-items: center;
	gap: 0.5rem;

	&:hover {
		cursor: pointer;
		color: var(--purple)
	}

	&.selected {
		color: var(--purple);
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
}
</style>
