<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo';

definePageMeta({
	layout: 'docs',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const headline = computed(() => findPageHeadline(page.value!));

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryContent().where({ _extension: 'md', navigation: { $ne: false } }).only(['title', 'description', '_path']).findSurround(withoutTrailingSlash(route.path)));
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:description="page!.description"
			:links="page!.links"
			:headline="headline"
		/>

		<UPageBody prose>
			<ContentRenderer
				v-if="page!.body"
				:value="page"
			/>

			<hr v-if="surround?.length">

			<UContentSurround :surround="surround" />
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
