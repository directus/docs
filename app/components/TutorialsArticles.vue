<script setup lang="ts">
const props = defineProps<{
	path: string;
	limit?: number;
  categoryTitle: string;
}>();

const { data: articles } = await useAsyncData(props.path + '-preview', () => {
	const query = queryContent(props.path)
		.where({ _path: { $ne: props.path } })
		.only(['title', 'description', 'icon', '_path', 'technologies']);

	if (props.limit) {
		query.limit(props.limit);
	}

	return query.find();
});

const moreImageSrc = '/img/tutorials/more.png';

const imageSrc = (article: { technologies: string[] }) => {
	const technologies = article?.technologies || ['directus'];
	const techString = technologies.join(', ');
	return `/api/tutorialimg?logos=${techString}`;
};
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
				<div class="grid grid-cols-4 gap-4">
					<img class="col-span-2" :src="imageSrc(article)" alt="Generated Image"/>
					<div class="col-span-2">
						<ProseP class="text-gray-900 dark:text-white text-base truncate font-bold text-pretty">
							{{ article.title }}
						</ProseP>
						<ProseP class="text-[15px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
							{{ article.description }}
						</ProseP>
					</div>
				</div>
			</ShinyCard>
		</template>
		<ShinyCard
			:to="path"
			class="col-span-6"
			:ui="{
				body: {
					base: 'gap-0',
				},
				title: 'font-bold text-pretty',
				description: 'line-clamp-2',
			}"
			:color="cardColor(categoryTitle)">
			<div class="grid grid-cols-4 gap-4">
				<img class="col-span-2" :src="moreImageSrc" alt="More {{ categoryTitle }} tutorials"/>
				<div class="col-span-2 flex flex-col justify-center">
					<ProseP class="text-gray-900 dark:text-white text-base truncate font-bold text-pretty">
						See all {{ categoryTitle }} tutorials
					</ProseP>
				</div>
			</div>
		</ShinyCard>
	</ShinyGrid>
</template>
