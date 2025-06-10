<script setup lang="ts">
import type {
	OpenAPIObject,
	RequestBodyObject,
} from 'openapi3-ts/oas30';
import type {
	DerefedOperationObject,
	FlattenedOperationObject,
} from '~/types';

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
	const responseSchema = responseBodyObjects?.value?.['200']?.content?.['application/json']?.schema
		|| responseBodyObjects?.value?.['200']?.content?.['application/text']?.schema;

	if (responseSchema) {
		return responseToExample(openapi, responseSchema);
	}

	return null;
});
</script>

<template>
	<UPageBody
		:key="operation.method + operation.path"
		class="lg:flex gap-10 items-start border-b border-default last:border-0 w-full"
		:ui="{
			prose: 'prose prose-primary dark:prose-invert',
		}"
		prose
	>
		<div class="grow shrink-0 basis-6/12">
			<ProseH2
				:id="slugify(operation.summary!)"
				class="endpoint-title sticky pt-2 pb-2 top-16 bg-default/75 backdrop-blur z-10 w-full  border-b border-default -mx-2 px-2"
			>
				{{ operation.summary }}
			</ProseH2>

			<ProseP class="endpoint-description">
				{{ operation.description }}
			</ProseP>

			<div
				v-if="operation.parameters && operation.parameters.length > 0"
				class="mb-12 last:mb-0"
			>
				<ProseH4
					:id="slugify(operation.summary!) + '-params'"
				>
					Query Parameters
				</ProseH4>
				<ProseFieldGroup>
					<ProseField
						v-for="param of operation.parameters"
						:key="param.name"
						:name="param.name"
						:type="param.schema?.type"
						:ui="{
							root: 'mb-0',
							description: 'mt-2',
						}"
						class="[&_p]:my-0"
					>
						<MDC
							v-if="param.description"
							:value="param.description"
						/>
					</ProseField>
				</ProseFieldGroup>
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

			<div class="mb-12 last:mb-0">
				<ProseH4 class="mt-12">
					Responses
				</ProseH4>
				<UTabs
					variant="link"
					:items="Object.keys(responseBodyObjects).map((code, index) => ({
						label: code,
						meta: responseBodyObjects[code],
						index,
					}))"
					:unmount-on-hide="false"
				>
					<template #default="{ item }">
						<UBadge
							variant="soft"
							size="lg"
							class="font-mono"
							color="neutral"
						>
							<UChip
								standalone
								inset
								:color="item.label.toString().startsWith('2') ? 'success' : 'error'"
							/>
							{{ item.label }}
						</UBadge>
					</template>
					<template
						#content="{ item }"
					>
						<div>
							{{ item.meta.description }}
						</div>
						<ApiParams
							v-if="flattenedResponseBodySchemas[item.index]"
							:param="flattenedResponseBodySchemas[item.index]"
						/>
					</template>
				</UTabs>
			</div>
		</div>
		<div class="grow sticky top-16 w-full">
			<MDC
				v-if="'x-codeSamples' in operation"
				:key="`code-samples-${operation.method}-${operation.path}`"
				:value="codeSamplesMd(operation)"
			/>
			<MDC
				v-if="responseBodyExample"
				:key="`response-example-${operation.method}-${operation.path}`"
				:value="preMd('json', 'Response Example', responseBodyExample)"
			/>
		</div>
	</UPageBody>
</template>
