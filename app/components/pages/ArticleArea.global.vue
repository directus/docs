<script setup lang="ts">
const props = defineProps<{
	data: PageContent;
}>();

const dataPath = props.data._path;

if (!dataPath) {
	throw createError({
		statusCode: 404,
		fatal: true,
	});
}

const { data: navigation } = await useAsyncData(
	`navigation:${props.data._path}`,
	() =>
		fetchContentNavigation(
			queryContent(dataPath),
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
	if (!area.value) return [];
	return [
		{
			title: 'All',
			_path: props.data._path,
		} as ArticleNavItem,
		...(area.value.children ? area.value.children : []),
	];
});

const allArticlesFlattened = computed(() => {
	const articles = [];

	for (const category of categories.value) {
		articles.push(
			...(category.children
				? category.children.map(article => ({
					...article,
					category: category.title,
				}))
				: []) as ArticleNavItems,
		);
	}
	return articles;
});

const allTags = computed(() => {
	const tagIds = new Set<string>();
	const tags: ArticleTags = [];
	for (const article of allArticlesFlattened.value) {
		if (article.tags) {
			for (const tag of article.tags) {
				tagIds.add(tag.id);
				tags.push(tag);
			}
		}
	}
	const tagIdsArray = Array.from(tagIds);

	return tagIdsArray.map(tagId => tags.find(tag => tag.id === tagId)).filter(
		(tag): tag is ArticleTag => tag !== undefined,
	).sort(
		(a, b) => a?.name?.localeCompare(b?.name || '') ?? 0,
	);
});

const { selectedTags } = useTags();

const filteredArticles = computed(() => {
	if (!selectedTags.value.length || !allArticlesFlattened.value || selectedTags.value.length == 0) return allArticlesFlattened.value.map(article => ({ ...article, description: null }));
	return allArticlesFlattened.value.filter(article =>
		article.tags?.some(tag => selectedTags.value.includes(tag.name)) ?? false,
	).map(article => ({ ...article, description: null }));
});
</script>

<template>
	<DefaultLayout>
		<ArticlesLayout
			:title="area?.title || 'Articles'"
			:categories="categories"
			:articles="filteredArticles"
			:tags="allTags"
		/>
	</DefaultLayout>
</template>
