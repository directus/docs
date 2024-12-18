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

const paths = computed(() => {
	const paths = [];

	for (const [path, pathItemObject] of Object.entries(openapi.paths)) {
		for (const method of methods) {
			if (pathItemObject[method]) {
				const operationObject: OperationObject = pathItemObject[method];

				if (operationObject.tags?.includes(tag.value!.name)) {
					paths.push({
						...operationObject,
						method, path,
					});
				}
			}
		}
	}

	return paths;
});

if (!tag.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}
</script>

<template>
	<UPage>
		<div class="flex gap-6 items-center border-b border-gray-200 dark:border-gray-800">
			<UPageHeader
				:title="tag!.name"
				:description="tag!.description"
				class="shrink basis-6/12 border-0"
			/>
			<ApiNav :paths="paths" />
		</div>
		<UPageBody
			v-for="path in paths"
			:key="path.method + path.path"
			class="flex gap-6 items-center border-b border-gray-200 dark:border-gray-800"
			prose
		>
			<div>
				<ProseH2 :id="path.method + path.path">
					{{ path.summary }}
				</ProseH2>

				<template v-if="path.parameters">
					<ProseH3 :id="path.method + path.path + '-params'">
						Query Parameters
					</ProseH3>
					<FieldGroup>
						<template v-for="param of path.parameters">
							<Field
								v-if="'$ref' in param"
								:key="param.$ref"
								:name="param.$ref"
								type="TBD"
							>
								{{ param.$ref }}
							</Field>

							<Field
								v-else
								:key="param.name"
								:name="param.name"
								:type="param.schema?.type"
							>
								{{ param.description }}
							</Field>
						</template>
					</FieldGroup>
				</template>
			</div>
			<CodeGroup>
				<ProsePre
					v-for="(example, index) in path['x-codeSamples']"
					:key="index"
					:language="example.language"
					:filename="example.label"
					:code="example.source"
				>
					{{ example.source }}
				</ProsePre>
			</CodeGroup>
		</UPageBody>
	</UPage>
</template>
