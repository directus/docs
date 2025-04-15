<script setup lang="ts">
const props = defineProps<{
	path: string;
	limit?: number;
}>();

const { data: articles } = await useAsyncData(props.path + '-preview', () => {
	const query = queryContent(props.path)
		.where({ _path: { $ne: props.path } })
		.only(['title', 'description', 'icon', '_path']);

	if (props.limit) {
		query.limit(props.limit);
	}

	return query.find();
});
</script>

<template>
	<ShinyGrid class="mt-8 gap-10">
		<template
			v-for="article in articles"
			:key="article._path"
		>
			<ShinyCard
				v-if="article.title"
				:title="article.title"
				:description="article.description"
				:to="article._path"
				:icon="article.icon"
				class="col-span-6"
				:ui="{
					body: {
						base: 'gap-0',
					},
					title: 'font-bold text-pretty',
					description: 'line-clamp-2',
				}"
				:color="cardColor(article.title)"
			/>
		</template>
	</ShinyGrid>
</template>
