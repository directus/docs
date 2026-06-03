<script setup lang="ts">
const props = defineProps<{ class?: string }>();
const slots = defineSlots<{
	left?: () => unknown;
	default?: () => unknown;
	right?: () => unknown;
}>();
</script>

<template>
	<div
		class="docs-page"
		:class="[
			!!slots.left && 'docs-page--has-left',
			!!slots.right && 'docs-page--has-right',
			props.class,
		]"
	>
		<aside
			v-if="!!slots.left"
			class="docs-page__left"
		>
			<slot name="left" />
		</aside>

		<div class="docs-page__center min-w-0">
			<slot />
		</div>

		<aside
			v-if="!!slots.right"
			class="docs-page__right"
		>
			<slot name="right" />
		</aside>
	</div>
</template>

<style>
/*
 * Docs page grid: left nav | center | right TOC.
 *
 * Breakpoints are container queries against the `docs-pane` parent set on
 * <DocsShell>, so the AI split panel collapses the layout based on pane width
 * instead of viewport width.
 *
 *   < 48rem      single column
 *   48–64rem     left + center (right TOC hides)
 *   ≥ 64rem      left + center + right (when both slots present)
 */
.docs-page {
	display: flex;
	flex-direction: column;
}

.docs-page__left,
.docs-page__right {
	display: none;
}

@container docs-pane (min-width: 48rem) {
	.docs-page--has-left {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 8fr);
		gap: 2.5rem;
	}

	.docs-page--has-left .docs-page__left {
		display: block;
	}
}

@container docs-pane (min-width: 64rem) {
	.docs-page--has-right:not(.docs-page--has-left) {
		display: grid;
		grid-template-columns: minmax(0, 8fr) minmax(0, 2fr);
		gap: 2.5rem;
	}

	.docs-page--has-left.docs-page--has-right {
		grid-template-columns: minmax(0, 2fr) minmax(0, 6fr) minmax(0, 2fr);
	}

	.docs-page--has-right .docs-page__right {
		display: block;
	}
}
</style>
