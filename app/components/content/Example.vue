<script setup lang="ts">
withDefaults(defineProps<{
	title?: string;
	icon?: string;
}>(), {
	title: 'Example',
	icon: 'material-symbols:info-outline',
});
</script>

<template>
	<ProseCallout :icon>
		<strong>{{ title }}</strong>
		<slot />
	</ProseCallout>
</template>
