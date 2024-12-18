<script setup lang="ts">
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import type { DerefedOperationObject, FlattenedOperationObject } from '~/types';

const openapi = inject<OpenAPIObject>('openapi')!;

const props = defineProps<{
	operation: FlattenedOperationObject<DerefedOperationObject>;
}>();

const responseExample = computed(() => {
	const responseSchema = props.operation.responses?.['200']?.content?.['application/json']?.schema;

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
		<div class="grow shrink-0 basis-5/12">
			<ProseH2 :id="operation.method + operation.path">
				{{ operation.summary }}
			</ProseH2>

			<ProseP>
				{{ operation.description }}
			</ProseP>

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

		<div class="grow sticky top-16">
			<MDC :value="codeSamplesMd(operation['x-codeSamples'])" />
			<MDC
				v-if="responseExample"
				:value="preMd('json', 'Response Example', responseExample)"
			/>
		</div>
	</UPageBody>
</template>
