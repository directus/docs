<script setup lang="ts">
/**
 * Renderer for OpenAPI parameter/response descriptions.
 *
 * The full <MDC> component spins up the markdown parser + Shiki per instance,
 * and the API reference renders thousands of these recursively, which exhausts
 * the prerender heap. The overwhelming majority of descriptions are a single
 * line of plain text with no markdown, so we render those as a plain paragraph
 * and avoid the parser entirely.
 *
 * Anything containing markdown syntax (inline code, links, emphasis, lists,
 * code fences, etc.) falls back to <MDC> so its output stays correct.
 */
import { computed } from 'vue';

const props = defineProps<{
	value: string;
}>();

// Defer to MDC for a faithful render when the description contains any markdown
// control character or a line break - a plain <p> would collapse paragraph
// breaks and drop list/heading structure.
const hasMarkdown = computed(() => /[`*_[\]<>#|\n]|\]\(/.test(props.value));
</script>

<template>
	<MDC
		v-if="hasMarkdown"
		:value="value"
	/>
	<p v-else>
		{{ value }}
	</p>
</template>
