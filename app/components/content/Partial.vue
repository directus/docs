<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	content: string;
}>();

const path = computed(() => `/_partials/${props.content}`);

const { data: partialContent, pending, error } = await useAsyncData(
	path.value,
	() => queryCollection('content').path(path.value).first(),
);

if (!partialContent.value && !pending.value) {
	console.warn(`Partial content not found for path: ${path.value}`);
}
</script>

<template>
	<div v-if="pending">
		Loading partial...
	</div>
	<div v-else-if="error">
		Error loading partial: {{ error?.message }}
	</div>
	<ContentRenderer
		v-else-if="partialContent"
		:value="partialContent"
	/>
	<div v-else>
		Partial content '{{ content }}' not found.
	</div>
</template>
