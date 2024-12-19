<script setup lang="ts">
const props = defineProps<{
	path: string;
	limit?: number;
}>();

const { data: articles } = await useAsyncData(props.path + '-preview', () => {
	const query = queryContent(props.path)
		.where({ _path: { $ne: props.path } })
		.only(['title', 'description', '_path']);

	if (props.limit) {
		query.limit(props.limit);
	}

	return query.find();
});
</script>

<template>
	<ULandingGrid class="mt-8">
		<template
			v-for="article in articles"
			:key="article._path"
		>
			<ULandingCard
				v-if="article.title"
				:title="article.title"
				:to="article._path"
				class="col-span-4"
				:ui="{
					body: {
						base: 'justify-center gap-0',
					},
					title: 'font-bold text-balance',
				}"
				:color="cardColor(article.title)"
			/>
		</template>
	</ULandingGrid>
</template>
