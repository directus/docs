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
		<template v-if="param.type === 'object' && param.children">
			<ApiParamsField
				v-for="child of param.children"
				:key="child.name"
				:param="child"
			/>
		</template>

		<ApiParamsField
			v-else
			:param="param"
		/>
	</FieldGroup>
</template>
