<script setup lang="ts">
import type {
	OpenAPIObject,
	RequestBodyObject,
} from "openapi3-ts/oas30";
import type {
	DerefedOperationObject,
	FlattenedOperationObject,
} from "~/types";

const openapi = inject<OpenAPIObject>('openapi')!;

const props = defineProps<{
	operation: FlattenedOperationObject<DerefedOperationObject>;
}>();

const requestBodyObject = computed(() => {
	if (!props.operation.requestBody) return null;

	return '$ref' in props.operation.requestBody ? resolveOasRef<RequestBodyObject>(openapi, props.operation.requestBody.$ref) : props.operation.requestBody ?? null;
});

const requestBodySchema = computed(() => {
	const contentSchema = requestBodyObject.value?.content?.['application/json']?.schema;

	if (contentSchema) {
		return flattenSchema(openapi, contentSchema);
	}

	return null;
});

const responseBodyObjects = computed(() => {
	return Object.fromEntries(
		Object.entries(props.operation.responses).map(([code, response]) => {
			return [
				code,
				response && '$ref' in response ? resolveOasRef<RequestBodyObject>(openapi, response.$ref) : response ?? null,
			];
		}));
});

const flattenedResponseBodySchemas = computed(() => {
	return Object.entries(responseBodyObjects.value).map(([_, response]: [string, RequestBodyObject | null]) => {
		const contentSchema = response?.content?.['application/json']?.schema;

		if (contentSchema) {
			return flattenSchema(openapi, contentSchema);
		}

		return null;
	});
});

const responseBodyExample = computed(() => {
	const responseSchema = responseBodyObjects?.value?.['200']?.content?.['application/json']?.schema;

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
			<ProseH2
				:id="slugify(operation.summary!)"
				class="endpoint-title"
			>
				{{ operation.summary }}
			</ProseH2>

			<ProseP class="endpoint-description">
				{{ operation.description }}
			</ProseP>

			<div
				v-if="operation.parameters"
				class="mb-12 last:mb-0"
			>
				<ProseH4 :id="slugify(operation.summary!) + '-params'">
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
				<ProseH4 :id="slugify(operation.summary!) + '-request'">
					Request Body
				</ProseH4>
				<ProseP v-if="requestBodyObject.description">
					{{ requestBodyObject.description }}
				</ProseP>
				<ApiParams :param="requestBodySchema" />
			</div>

			<div
        v-for="responseBodyObject, code, index in responseBodyObjects"
        :key="code"
				class="mb-12 last:mb-0"
			>
				<ProseH4 :id="slugify(operation.summary!) + '-' + responseBodyObject.code + '-response'">
					{{code}} Response
				</ProseH4>
				<ProseP v-if="responseBodyObject.description">
					{{ responseBodyObject.description }}
				</ProseP>
				<ApiParams v-if="flattenedResponseBodySchemas[index]" :param="flattenedResponseBodySchemas[index]" />
			</div>
		</div>

		<div class="grow sticky top-16 w-full">
			<MDC
				v-if="'x-codeSamples' in operation"
				:value="codeSamplesMd(operation)"
			/>
			<MDC
				v-if="responseBodyExample"
				:value="preMd('json', 'Response Example', responseBodyExample)"
			/>
		</div>
	</UPageBody>
</template>
