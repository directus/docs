<script setup lang="ts">
const props = defineProps<{
	data: PageContent;
}>();

const route = useRoute();

const path = route.path.split('/').filter(Boolean);

const routePath = path[0];
const dataPath = props.data._path;

if (!routePath || !dataPath) {
	throw createError({
		statusCode: 404,
		fatal: true,
	});
}

const { data: categories } = await useAsyncData<ArticleNavItems>(
	`categories:${path[0]}`,
	() => fetchContentNavigation(queryContent(routePath)),
);

const { data: navigation } = await useAsyncData<ArticleNavItems>(
	`navigation:${props.data._path}`,
	() => fetchContentNavigation(queryContent(dataPath)),
);

const area = computed(() => {
	if (!navigation.value) return null;
	return {
		title: navigation.value[0]?.title,
		_path: navigation.value[0]?._path,
		children: navigation.value[0]?.children,
	};
});

const categoriesFound = computed(() => {
	if (!categories.value) return [];
	return [
		{
			title: 'All',
			_path: `/${path[0]}`,
		},
		...(categories.value[0]?.children ? categories.value[0].children : []),
	];
});

const allArticlesFlattened = computed(() => {
	const categories = area.value?.children;
	if (!categories) return [];
	const articles = [];

	for (const category of categories) {
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
	if (
		!selectedTags.value.length
		|| !allArticlesFlattened.value
		|| selectedTags.value.length == 0
	)
		return allArticlesFlattened.value || [];
	return (
		allArticlesFlattened.value.filter(
			article =>
				article.tags?.some(tag => selectedTags.value.includes(tag.name))
				?? false,
		) || []
	);
});
</script>

<template>
	<DefaultLayout>
		<ArticlesLayout
			:title="area?.title || 'Articles'"
			:categories="categoriesFound"
			:articles="filteredArticles"
			:tags="allTags"
		/>
	</DefaultLayout>
</template>
