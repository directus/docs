<script setup lang="ts">
defineProps<{
	icon?: string;
	tone?: 'muted' | 'dimmed';
}>();
</script>

<template>
	<span
		class="inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-widest uppercase"
		:class="tone === 'dimmed' ? 'text-dimmed' : 'text-muted'"
	>
		<UIcon
			v-if="icon"
			:name="icon"
			class="size-3.5"
		/>
		<slot />
	</span>
</template>
