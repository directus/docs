<script setup lang="ts">
withDefaults(defineProps<{
	title?: string;
	icon?: string;
}>(), {
	title: 'Example',
	icon: 'i-lucide-info',
});
</script>

<template>
	<ProseCallout :icon>
		<strong>{{ title }}</strong>
		<slot />
	</ProseCallout>
</template>
