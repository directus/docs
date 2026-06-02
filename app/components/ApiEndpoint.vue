<script setup lang="ts">
import type { ApiReferenceOperation } from '~/types';

const props = defineProps<{
	operation: ApiReferenceOperation;
}>();

const responseTabs = computed(() => props.operation.responses.map((response, index) => ({
	label: response.code,
	meta: response,
	index,
})));

type StatusCodeDescriptions = {
	[key: number]: string;
};

const statusCodeDescriptions: StatusCodeDescriptions = {
	200: 'OK',
	201: 'Created',
	204: 'No Content',
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	422: 'Unprocessable Content',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
	503: 'Service Unavailable',
};
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
						<ApiInlineMarkdown
							v-if="param.description"
							:value="param.description"
						/>
					</ProseField>
				</ProseFieldGroup>
			</div>

			<div
				v-if="operation.requestBody?.schema"
				class="mb-12 last:mb-0"
			>
				<ProseH4 :id="slugify(operation.summary!) + '-request'">
					Request Body
				</ProseH4>
				<ProseP v-if="operation.requestBody.description">
					{{ operation.requestBody.description }}
				</ProseP>
				<ApiParams :param="operation.requestBody.schema" />
			</div>

			<div class="mb-12 last:mb-0">
				<ProseH4
					id="responses"
					class="mt-12"
				>
					Responses
				</ProseH4>
				<UTabs
					variant="link"
					:items="responseTabs"
					:unmount-on-hide="false"
				>
					<template #default="{ item }">
						<UBadge
							variant="soft"
							class="font-mono"
							color="neutral"
						>
							<UChip
								standalone
								inset
								:color="item.label.toString().startsWith('2') ? 'success' : 'error'"
							/>
							{{ item.label }} {{ statusCodeDescriptions[Number(item.label)] || '' }}
						</UBadge>
					</template>
					<template
						#content="{ item }"
					>
						<div>
							{{ item.meta.description }}
						</div>
						<ApiParams
							v-if="item.meta.schema"
							:param="item.meta.schema"
						/>
					</template>
				</UTabs>
			</div>
		</div>
		<div class="grow min-w-0 sticky top-16 w-full">
			<ApiCodeSamples
				:method="operation.method"
				:path="operation.path"
				:rest-html="operation.restSampleHtml"
				:samples="operation['x-codeSamples']"
			/>
			<ApiResponseExample
				v-if="operation.responseExampleHtml"
				:html="operation.responseExampleHtml"
				:source="operation.responseExample"
			/>
		</div>
	</UPageBody>
</template>
