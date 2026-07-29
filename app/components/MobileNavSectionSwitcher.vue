<script setup lang="ts">
import type { DocsSection } from '#shared/utils/docsSections';

const props = defineProps<{
	items: Array<{ title: string; to: string; icon?: string; active: boolean; indent?: boolean }>;
	currentSection: DocsSection | null;
}>();

const currentLabel = computed(() => props.currentSection?.label ?? props.items.find(i => i.active)?.title ?? 'Navigate');
const currentIcon = computed(() => props.currentSection?.icon ?? props.items.find(i => i.active)?.icon);

const dropdownItems = computed(() =>
	props.items.map(item => ({
		label: item.title,
		icon: item.icon,
		to: item.to,
		class: item.indent ? 'pl-6' : '',
	})),
);
</script>

<template>
	<div class="mb-4">
		<p class="text-xs font-medium text-dimmed uppercase font-mono tracking-widest mb-2">
			Navigate to
		</p>
		<UDropdownMenu
			:items="dropdownItems"
			class="w-full"
			:ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
		>
			<UButton
				:label="currentLabel"
				:leading-icon="currentIcon"
				color="neutral"
				variant="outline"
				class="w-full rounded-md"
				:ui="{ trailingIcon: 'ms-auto' }"
				trailing-icon="i-lucide-chevrons-up-down"
			/>
		</UDropdownMenu>
		<USeparator type="dashed" class="mt-4" />
	</div>
</template>
