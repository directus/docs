<script setup lang="ts">
import type { FlattenedParam } from '~/types';

defineProps<{
	param: FlattenedParam;
}>();
</script>

<template>
	<Field
		:key="param.name"
		:name="param.name || `[${param.type}]`"
		:type="param.type"
	>
		<MDC
			v-if="param.description"
			:value="param.description"
		/>

		<Collapsible v-if="param.anyOf">
			<ApiParamsAnyOf :params="param.anyOf" />
		</Collapsible>

		<Collapsible v-else-if="'children' in param">
			<ApiParams
				v-for="child of param.children"
				:key="child.name"
				:param="child"
				:root="false"
			/>
		</Collapsible>
	</Field>
</template>
