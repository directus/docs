<script setup lang="ts">
defineProps<{
	content: string;
}>();
</script>

<template>
	<ContentQuery
		v-slot="{ data }"
		:path="`/_partials/${content}`"
		find="one"
	>
		<ContentRenderer :value="data" />
	</ContentQuery>
</template>
