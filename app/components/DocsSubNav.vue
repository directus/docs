<script setup lang="ts">
defineProps<{
	items: {
		label: string;
		to: string;
		icon: string;
		active: boolean;
	}[];
	show: boolean;
}>();
</script>

<template>
	<div
		v-show="show"
		class="docs-subnav hidden @min-[40rem]/docs-pane:flex items-center sticky z-30 bg-default/75 backdrop-blur border-b border-default"
		:aria-hidden="!show"
	>
		<UContainer class="flex items-center justify-between gap-4">
			<UNavigationMenu
				:items="items"
				orientation="horizontal"
				variant="link"
			/>
			<SettingsDrawerTrigger show-label />
		</UContainer>
	</div>
</template>

<style>
/*
 * Sub-nav row: hidden when the docs pane is narrow (single-column layout).
 * The CSS variable is consumed elsewhere for sticky offsets, so it's set on
 * the docs-pane container and zeroed out when the sub-nav hides.
 */
.docs-pane {
	--ui-subnav-height: 0px;
}
@container docs-pane (min-width: 40rem) {
	.docs-pane.docs-pane--has-subnav {
		--ui-subnav-height: 48px;
	}
}
.docs-subnav {
	height: var(--ui-subnav-height);
	top: var(--ui-header-height);
}
</style>
