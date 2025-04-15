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
				:color="cardColor(article.title)">
        <div>
          <ProseP class="text-gray-900 dark:text-white text-base truncate font-bold text-pretty">
            {{ article.title }}
          </ProseP>
          <ProseP class="text-[15px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {{ article.description }}
          </ProseP>
        </div>
      </ShinyCard>
		</template>
	</ShinyGrid>
</template>
