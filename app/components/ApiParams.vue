<script setup lang="ts">
import type { FlattenedParam } from '~/types';

withDefaults(defineProps<{
	param: FlattenedParam;
	root?: boolean;
}>(), {
	root: true,
});
</script>

<template>
	<FieldGroup>
		<Field
			:key="param.name"
			:name="param.name || `[${param.type}]`"
			:type="param.type"
		>
			<MDC
				v-if="param.description"
				:value="param.description"
			/>

			<Collapsible
				v-if="'children' in param"
				open
			>
				<ApiParamsField
					v-for="child of param.children"
					:key="child.name"
					:param="child"
				/>
			</Collapsible>
		</Field>
	</FieldGroup>
</template>
