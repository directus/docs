<script setup lang="ts">
definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path('/tutorials').first());

const { data: categories } = await useAsyncData(route.path + '-categories', () => queryCollection('content')
	.where('stem', 'LIKE', 'tutorials/%/index')
	// .select('title', 'description', 'path')
	.all());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:ui="{ title: 'title' }"
		>
			<template #description>
				<div class="max-w-prose">
					<ContentRenderer
						v-if="page!.body"
						:value="page!"
					/>
				</div>
			</template>
		</UPageHeader>

		<UPageBody prose>
			<TutorialsCategory
				v-for="category in categories"
				:key="category.path"
				:title="category.title!"
				:description="category.description!"
				:path="category.path!"
				:limit="6"
				class="mb-8 pb-8 last:mb-0 border-b border-gray-200 dark:border-gray-800"
			/>
		</UPageBody>
	</UPage>
</template>
