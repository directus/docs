<script setup lang="ts">
import type { OpenAPIObject } from 'openapi3-ts/oas30';

definePageMeta({
	layout: 'api',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path(route.path).first());

const openapi = inject<OpenAPIObject>('openapi')!;

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:description="page!.description"
			:ui="{ title: 'title', headline: 'headline' }"
		>
			<template #headline>
				For Directus v{{ openapi.info.version }}+
			</template>
		</UPageHeader>
		<UPageBody prose>
			<ContentRenderer
				v-if="page!.body"
				:value="page!"
			/>
		</UPageBody>
	</UPage>
</template>
