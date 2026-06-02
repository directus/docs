<script setup lang="ts">
import type { ApiReferenceTagPage } from '~/types';

definePageMeta({
	layout: 'api',
});

const route = useRoute();
const tagSlug = computed(() => String(route.params.tag));
const apiReferencePages = import.meta.glob<ApiReferenceTagPage>('../../generated/api-reference/tags/*.ts', {
	import: 'default',
});

const { data: apiReferencePage } = await useAsyncData(
	() => `api-reference-${tagSlug.value}`,
	async () => {
		const loader = apiReferencePages[`../../generated/api-reference/tags/${tagSlug.value}.ts`];
		return loader ? await loader() : null;
	},
	{ watch: [tagSlug] },
);

const tag = computed(() => apiReferencePage.value?.tag);
const operations = computed(() => apiReferencePage.value?.operations ?? []);

if (!apiReferencePage.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}
</script>

<template>
	<UPage>
		<div class="lg:flex gap-10 items-center border-b border-default py-7">
			<UPageHeader
				:title="tag!.name"
				:description="tag!.description"
				class="shrink basis-6/12 border-0"
				:ui="{ title: 'title' }"
			/>
			<ApiNav :operations="operations" />
		</div>

		<ApiEndpoint
			v-for="operation of operations"
			:key="operation.method + operation.path"
			:operation="operation"
		/>
	</UPage>
</template>
