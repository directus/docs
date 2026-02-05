<script setup lang="ts">
const props = defineProps<{
	path: string;
	limit?: number;
}>();

const { data: articles } = await useAsyncData(props.path + '-preview', () => {
	const query = queryCollection('content')
		.where('path', 'LIKE', `${props.path}/%`)
		.select('title', 'description', 'icon', 'path', 'technologies', 'navigation');

	if (props.limit) {
		query.limit(props.limit);
	}

	return query.all();
});

const imageSrc = (article: { technologies?: string[] }) => {
	const technologies = article?.technologies || ['directus'];
	const techString = technologies.join(', ');
	return `/docs/api/tutorialimg?logos=${techString}`;
};
</script>

<template>
	<div
		class="mt-8 gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
	>
		<template
			v-for="article in articles"
			:key="article.path"
		>
			<UPageCard
				v-if="article.title && article.navigation !== false"
				:to="article.path"
				:icon="article.icon"
				:ui="{
					title: 'font-bold text-pretty',
					description: 'line-clamp-2',
					container: 'p-4 md:p-4 lg:p-4',

				}"
				class="hover:bg-primary/5 hover:ring-primary"
			>
				<div class="min-w-0">
					<img
						class="mb-0 max-h-36 w-full object-cover dark:brightness-90 rounded"
						:src="imageSrc(article)"
						alt="Generated Image"
					>
					<div class="col-span-2">
						<ProseP class="text-gray-900 dark:text-white text-base truncate font-bold text-pretty">
							{{ article.title }}
						</ProseP>
						<ProseP class="text-[15px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
							{{ article.description }}
						</ProseP>
					</div>
				</div>
			</UPageCard>
		</template>
	</div>
</template>
