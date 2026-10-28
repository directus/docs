<script setup lang="ts">
const props = defineProps<{
	article: {
		title?: string;
		description?: string;
		path?: string;
		icon?: string;
		technologies?: string[];
		navigation?: false | unknown;
	};
}>();

// Cards are baked by `pnpm tutorial-cards`.
const imageSrc = computed(() => `/docs/img/tutorials/cards/${props.article.technologies?.[0] ?? 'directus'}.jpg`);
</script>

<template>
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
				:src="imageSrc"
				alt=""
			>
			<div class="col-span-2">
				<ProseP class="text-gray-900 dark:text-white text-base truncate font-bold text-pretty">
					{{ article.title }}
				</ProseP>
				<ProseP class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
					{{ article.description }}
				</ProseP>
			</div>
		</div>
	</UPageCard>
</template>
