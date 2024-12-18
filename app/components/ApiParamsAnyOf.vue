<script setup lang="ts">
import type { FlattenedParam } from '~/types';

defineProps<{
	params: FlattenedParam[];
}>();
</script>

<template>
	<div>
		<ProseP v-if="params.length > 1">
			Any of the following:
		</ProseP>

		<template
			v-for="(child, index) of params"
			:key="child.name"
		>
			<ApiParamsField :param="child" />
			<UDivider
				v-if="params.length > 1 && index !== params.length - 1"
				label="or"
				class="mt-4"
			/>
		</template>
	</div>
</template>
