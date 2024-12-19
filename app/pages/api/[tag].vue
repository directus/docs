<script setup lang="ts">
import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas30';
import { METHODS } from '~/constants';
import type { FlattenedOperationObject, DerefedOperationObject } from '~/types';

const openapi = inject<OpenAPIObject>('openapi')!;

definePageMeta({
	layout: 'api',
});

const route = useRoute();

const tag = computed(() => {
	return openapi.tags?.find(tag => tag.name.toLowerCase() === route.params.tag);
});

const operations = computed<FlattenedOperationObject<DerefedOperationObject>[]>(() => {
	const operations = [];

	for (const [path, pathItemObject] of Object.entries(openapi.paths)) {
		for (const method of METHODS) {
			if (pathItemObject[method]) {
				const operationObject: OperationObject = pathItemObject[method];

				if (operationObject.tags?.includes(tag.value!.name)) {
					operations.push({
						...operationObject,
						method, path,
					});
				}
			}
		}
	}

	return derefOperations(openapi, operations);
});

if (!tag.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}
</script>

<template>
	<UPage>
		<div class="lg:flex gap-10 items-center border-b border-gray-200 dark:border-gray-800 max-w-7xl py-7">
			<UPageHeader
				:title="tag!.name"
				:description="tag!.description"
				class="shrink basis-6/12 border-0"
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
