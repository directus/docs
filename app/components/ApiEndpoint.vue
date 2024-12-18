<script setup lang="ts">
import type { OpenAPIObject, RequestBodyObject } from 'openapi3-ts/oas30';
import type { DerefedOperationObject, FlattenedOperationObject } from '~/types';

const openapi = inject<OpenAPIObject>('openapi')!;

const props = defineProps<{
	operation: FlattenedOperationObject<DerefedOperationObject>;
}>();

const requestBodyObject = computed(() => {
	if (!props.operation.requestBody) return null;

	return '$ref' in props.operation.requestBody ? resolveRef<RequestBodyObject>(openapi, props.operation.requestBody.$ref) : props.operation.requestBody ?? null;
});

const requestBodySchema = computed(() => {
	const contentSchema = requestBodyObject.value?.content?.['application/json']?.schema;

	if (contentSchema) {
		return flattenSchema(openapi, contentSchema);
	}

	return null;
});

const responseBodyObject = computed(() => {
	if (!props.operation.responses?.['200']) return null;

	return '$ref' in props.operation.responses['200']
		? resolveRef<RequestBodyObject>(openapi, props.operation.responses['200'].$ref)
		: props.operation.responses['200'] ?? null;
});

const flattenedResponseBodySchema = computed(() => {
	const contentSchema = responseBodyObject.value?.content?.['application/json']?.schema;

	if (contentSchema) {
		return flattenSchema(openapi, contentSchema);
	}

	return null;
});

const responseBodyExample = computed(() => {
	const responseSchema = responseBodyObject.value?.content?.['application/json']?.schema;

	if (responseSchema) {
		return responseToExample(openapi, responseSchema);
	}

	return null;
});
</script>

<template>
	<UPageBody
		:key="operation.method + operation.path"
		class="lg:flex gap-10 items-start border-b last:border-0 border-gray-200 dark:border-gray-800"
		:ui="{
			prose: 'prose prose-primary dark:prose-invert max-w-7xl',
		}"
		prose
	>
		<div class="grow shrink-0 basis-6/12">
			<ProseH2 :id="operation.method + operation.path">
				{{ operation.summary }}
			</ProseH2>

			<ProseP>
				{{ operation.description }}
			</ProseP>

			<div
				v-if="operation.parameters"
				class="mb-12 last:mb-0"
			>
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
			</div>

			<div
				v-if="requestBodyObject && requestBodySchema"
				class="mb-12 last:mb-0"
			>
				<ProseH4 :id="operation.method + operation.path + '-body'">
					Request Body
				</ProseH4>
				<ProseP v-if="requestBodyObject.description">
					{{ requestBodyObject.description }}
				</ProseP>
				<ApiParams :param="requestBodySchema" />
			</div>

			<div
				v-if="responseBodyObject && flattenedResponseBodySchema"
				class="mb-12 last:mb-0"
			>
				<ProseH4 :id="operation.method + operation.path + '-response'">
					Response
				</ProseH4>
				<ProseP v-if="responseBodyObject.description">
					{{ responseBodyObject.description }}
				</ProseP>
				<ApiParams :param="flattenedResponseBodySchema" />
			</div>
		</div>

		<div class="grow sticky top-16">
			<MDC :value="codeSamplesMd(operation['x-codeSamples'])" />
			<MDC
				v-if="responseBodyExample"
				:value="preMd('json', 'Response Example', responseBodyExample)"
			/>
		</div>
	</UPageBody>
</template>
