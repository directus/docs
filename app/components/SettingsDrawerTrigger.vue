<script setup lang="ts">
const { showLabel = false } = defineProps<{ showLabel?: boolean }>();

const settings = useSettingsOverlay();
</script>

<template>
	<UButton
		icon="i-lucide-sliders-horizontal"
		variant="ghost"
		color="neutral"
		size="sm"
		aria-label="Personalize docs"
		@click="settings.open()"
	>
		<span
			v-if="showLabel"
			class="hidden @min-[64rem]/docs-pane:inline"
		>
			Personalize
		</span>
	</UButton>
</template>
