<script setup lang="ts">
definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

defineOgImage({
	component: 'OgImageDefault',
	props: {
		title: page.value.title,
		breadcrumb: pageBreadcrumb(page.value._path!),
	},
});
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:description="page!.description"
		/>

		<UPageBody prose>
			<ContentRenderer
				v-if="page!.body"
				:value="page"
			/>
		</UPageBody>

		<template
			v-if="page!.toc !== false"
			#right
		>
			<DocsToc
				:links="page!.body?.toc?.links"
				:authors="page!.authors"
				:file="page!._file!"
			/>
		</template>
	</UPage>
</template>
