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
	if (!categories.value) return null;
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
	const tags = new Set<ArticleTag>();
	for (const article of allArticlesFlattened.value) {
		if (article.tags) {
			for (const tag of article.tags) {
				tags.add(tag);
			}
		}
	}
	return Array.from(tags) || [];
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
				article.tags?.some(tag => selectedTags.value.includes(tag.id))
				?? false,
		) || []
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
					style="flex-grow: 1"
				>
					<ArticlesCategoryRow
						v-if="categoriesFound"
						:categories="categoriesFound"
					/>
					<ArticlesGrid :articles="filteredArticles" />
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
		color: var(--purple);
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
