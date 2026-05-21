<script setup lang="ts">
const { label = 'Search', showLabel = true } = defineProps<{
	label?: string;
	showLabel?: boolean;
}>();

const config = useRuntimeConfig();
const enabled = computed(() => Boolean(
	config.public.typesenseUrl
	&& config.public.typesensePublicApiKey
	&& config.public.typesenseCollection,
));
const search = useSearchOverlay();

defineShortcuts({
	meta_k: {
		usingInput: true,
		handler: () => {
			if (enabled.value) search.open();
		},
	},
});
</script>

<template>
	<UButton
		v-if="enabled"
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
