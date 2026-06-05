<script setup lang="ts">
import { apiReferenceMeta } from '~/generated/api-reference/meta';

definePageMeta({
	layout: 'api',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path(route.path).first());

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
				For Directus v{{ apiReferenceMeta.version }}+
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
