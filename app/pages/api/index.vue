<script setup lang="ts">
import type { OpenAPIObject } from 'openapi3-ts/oas30';

definePageMeta({
	layout: 'api',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne());

const openapi = inject<OpenAPIObject>('openapi')!;

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
		>
			<template #headline>
				For Directus v{{ openapi.info.version }}+
			</template>
		</UPageHeader>
		<UPageBody prose>
			<ContentRenderer
				v-if="page!.body"
				:value="page"
			/>
		</UPageBody>
	</UPage>
</template>
