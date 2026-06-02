<script setup lang="ts">
import { useScrollShadow } from '@nuxt/ui/composables';

const props = defineProps<{ class?: string }>();

const asideEl = useTemplateRef<HTMLElement>('asideEl');
const { style: scrollShadowStyle } = useScrollShadow(asideEl, { size: 48 });
</script>

<template>
	<aside
		ref="asideEl"
		:class="['docs-aside scrollbar-thin py-8 overflow-y-auto overflow-x-hidden', props.class]"
		:style="scrollShadowStyle"
	>
		<slot />
	</aside>
</template>

<style>
/*
 * Sticky side rail for left nav and right TOC. Hidden below the docs-pane
 * breakpoint where <DocsPage> collapses to a single column. Sticky offset
 * accounts for the header plus the optional sub-nav (--ui-subnav-height
 * resolves to 0px when the sub-nav is absent).
 */
.docs-aside {
	display: none;
}

@container docs-pane (min-width: 48rem) {
	.docs-aside {
		display: block;
		position: sticky;
		top: var(--ui-header-height);
		max-height: calc(100vh - var(--ui-header-height) - var(--ui-banner-height, 0px));
	}
}

@container docs-pane (min-width: 64rem) {
	.docs-aside {
		top: calc(var(--ui-header-height) + var(--ui-subnav-height));
		max-height: calc(100vh - var(--ui-header-height) - var(--ui-subnav-height) - var(--ui-banner-height, 0px));
	}
}
</style>
