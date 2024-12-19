<script setup lang="ts">
definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne());

const { data: categories } = await useAsyncData(route.path + '-categories', () => queryContent('tutorials').where({ _dir: { $eq: 'tutorials' } }).only(['title', 'description', '_path']).find());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
		>
			<template #description>
				<ContentRenderer
					v-if="page!.body"
					:value="page"
				/>
			</template>
		</UPageHeader>

		<UPageBody prose>
			<TutorialsCategory
				v-for="category in categories"
				:key="category._path"
				:title="category.title!"
				:description="category.description!"
				:path="category._path!"
			/>
		</UPageBody>
	</UPage>
</template>
