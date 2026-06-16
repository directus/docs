<script setup lang="ts">
const props = defineProps<{
	path: string;
	limit?: number;
}>();

const { data: articles } = await useAsyncData(`${props.path}-articles-${props.limit ?? 'all'}`, () => {
	const query = queryCollection('content')
		.where('path', 'LIKE', `${props.path}/%`)
		.select('title', 'description', 'icon', 'path', 'technologies', 'navigation');

	if (props.limit) {
		query.limit(props.limit);
	}

	return query.all();
});
</script>

<template>
	<div class="mt-8 gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
		<TutorialCard
			v-for="article in articles"
			:key="article.path"
			:article="article"
		/>
	</div>
</template>
