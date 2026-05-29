<script setup lang="ts">
const { label = 'Search', showLabel = true } = defineProps<{
	label?: string;
	showLabel?: boolean;
}>();

const search = useSearchOverlay();

defineShortcuts({
	meta_k: {
		usingInput: true,
		handler: () => {
			search.open();
		},
	},
});
</script>

<template>
	<UButton
		icon="heroicons:magnifying-glass-20-solid"
		variant="subtle"
		color="neutral"
		:aria-label="label"
		@click="search.open()"
	>
		<span
			v-if="showLabel"
			class="hidden @min-[64rem]/docs-pane:inline"
		>
			{{ label }} ⌘K
		</span>
	</UButton>
</template>
