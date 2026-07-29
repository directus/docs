<script setup lang="ts">
import { useClipboard } from '@vueuse/core';

const props = defineProps<{
	// Shiki-highlighted HTML for the response example, precomputed at build time.
	html: string;
	// Raw response example value, used for copy-to-clipboard.
	source?: unknown;
}>();

const copyText = computed(() =>
	typeof props.source === 'string' ? props.source : JSON.stringify(props.source, null, 2),
);

const { copy, copied } = useClipboard({ copiedDuring: 2000 });
</script>

<template>
	<div class="border border-default rounded-md overflow-hidden bg-default mt-4">
		<div class="flex items-center justify-between gap-2 pl-3 pr-2 py-1 border-b border-default bg-elevated">
			<span class="font-mono text-xs text-muted">Response Example</span>
			<UButton
				:icon="copied ? 'i-material-symbols-check' : 'i-material-symbols-content-copy-outline'"
				color="neutral"
				variant="ghost"
				size="xs"
				:aria-label="copied ? 'Copied' : 'Copy response'"
				class="shrink-0"
				@click="copy(copyText)"
			/>
		</div>
		<div
			class="api-response-pre"
			v-html="html"
		/>
	</div>
</template>

<style>
/* The code region scrolls on its own if content can't fit, so an overflowing
   example never widens the panel, pushes the copy button away, or grows the page
   taller than the viewport. The background lives here (not on the pre) so it
   fills the whole scroll area, including space past the wrapped content. */
.api-response-pre {
	max-width: 100%;
	max-height: 400px;
	overflow: auto;
	background-color: var(--ui-bg-muted);
	scrollbar-width: thin;
	scrollbar-color: var(--ui-border-accented) transparent;
}

.api-response-pre::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.api-response-pre::-webkit-scrollbar-thumb {
	background-color: var(--ui-border-accented);
	border-radius: 9999px;
}

.api-response-pre::-webkit-scrollbar-track {
	background: transparent;
}

.api-response-pre pre.shiki {
	border: 0 !important;
	border-radius: 0 !important;
	margin: 0 !important;
	padding: 0.75rem 1rem;
	font-size: 0.75rem;
	line-height: 1.5;
	background-color: transparent !important;
	/* Reflow long lines at whitespace so they wrap instead of scrolling, but
	   never split inside a token. A single token too wide to fit scrolls
	   horizontally (via the wrapper's overflow) rather than breaking mid-word. */
	white-space: pre-wrap;
	overflow-wrap: normal;
	word-break: normal;
}

/* Response uses the light syntax theme in light mode and the dark theme in
   dark mode, so it reads as a distinct surface from the dark request panel. */
.api-response-pre pre.shiki span {
	color: var(--shiki-light);
	background-color: var(--shiki-light-bg);
}

.dark .api-response-pre pre.shiki span {
	color: var(--shiki-dark);
	background-color: var(--shiki-dark-bg);
}
</style>
