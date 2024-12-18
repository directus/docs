<script setup lang="ts">
import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas30';
import { methods } from '~/constants';

const openapi = inject<OpenAPIObject>('openapi')!;

definePageMeta({
	layout: 'api',
});

const route = useRoute();

const tag = computed(() => {
	return openapi.tags?.find(tag => tag.name.toLowerCase() === route.params.tag);
});

const operations = computed(() => {
	const operations = [];

	for (const [path, pathItemObject] of Object.entries(openapi.paths)) {
		for (const method of methods) {
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
		<div class="flex gap-10 items-center border-b border-gray-200 dark:border-gray-800 max-w-6xl py-7">
			<UPageHeader
				:title="tag!.name"
				:description="tag!.description"
				class="shrink basis-6/12 border-0"
			/>
			<ApiNav :operations="operations" />
		</div>
		<UPageBody
			v-for="operation in operations"
			:key="operation.method + operation.path"
			class="flex gap-10 items-start border-b last:border-0 border-gray-200 dark:border-gray-800"
			:ui="{
				prose: 'prose prose-primary dark:prose-invert max-w-6xl',
			}"
			prose
		>
			<div class="grow shrink-0 basis-6/12">
				<ProseH2 :id="operation.method + operation.path">
					{{ operation.summary }}
				</ProseH2>

				<template v-if="operation.parameters">
					<ProseH4 :id="operation.method + operation.path + '-params'">
						Query Parameters
					</ProseH4>
					<FieldGroup>
						<Field
							v-for="param of operation.parameters"
							:key="param.name"
							:name="param.name"
							:type="param.schema?.type"
						>
							<MDC
								v-if="param.description"
								:value="param.description"
							/>
						</Field>
					</FieldGroup>
				</template>
			</div>

			<MDC
				class="grow basis-6/12 sticky top-16"
				:value="codeSamplesMd(operation['x-codeSamples'])"
			/>
		</UPageBody>
	</UPage>
</template>
