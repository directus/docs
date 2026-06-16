<script setup lang="ts">
import { strings } from '../strings';

const { toggle } = useAssistant();
</script>

<template>
	<UTooltip :text="strings.tooltip">
		<UButton
			icon="i-lucide-sparkles"
			:aria-label="strings.tooltip"
			color="neutral"
			variant="ghost"
			@click="toggle"
		>
			<span class="hidden sm:inline @max-[64rem]/docs-pane:hidden! @min-[64rem]/docs-pane:inline!">
				{{ strings.tooltip }}
			</span>
		</UButton>
	</UTooltip>
</template>
