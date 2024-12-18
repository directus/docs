<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo';

const { toc } = useAppConfig();

const props = defineProps({
	path: String,
})

const { data: page } = await useAsyncData(props.path, () => queryContent(props.path).findOne());

console.log(props.path)

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const headline = computed(() => findPageHeadline(page.value!));

const { data: surround } = await useAsyncData(`${props.path}-surround`, () => queryContent().where({ _extension: 'md', navigation: { $ne: false } }).only(['title', 'description', '_path']).findSurround(withoutTrailingSlash(route.path)));
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
			<UContentToc
				:title="toc?.title"
				:links="page!.body?.toc?.links"
			/>
		</template>
	</UPage>
</template>
