<script setup lang="ts">
import type { FlattenedParam } from '~/types';

defineProps<{
	param: FlattenedParam;
}>();
</script>

<template>
	<ProseField
		:key="param.name"
		:name="param.name || `[${param.type}]`"
		:type="param.type"
		:ui="{
			root: 'mb-0',
			description: 'mt-2',
		}"
		class="[&_p]:my-0"
	>
		<MDC
			v-if="param.description"
			:key="`description-${param.name}`"
			:value="param.description"
		/>

		<ProseCollapsible
			v-if="param.anyOf"
		>
			<ApiParamsAnyOf
				:params="param.anyOf"
				class="pl-4 border-l"
			/>
		</ProseCollapsible>

		<ProseCollapsible v-else-if="'children' in param">
			<ApiParams
				v-for="child of param.children"
				:key="child.name"
				:param="child"
				:root="false"
				class="pl-4 border-l"
			/>
		</ProseCollapsible>
	</ProseField>
</template>
