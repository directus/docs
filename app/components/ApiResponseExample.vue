<script setup lang="ts">
defineProps<{
	// Shiki-highlighted HTML for the response example, precomputed at build time.
	html: string;
}>();
</script>

<template>
	<div class="dark border border-default rounded-md overflow-hidden bg-default mt-4">
		<div class="flex items-center gap-2 px-3 py-2 border-b border-default bg-elevated font-mono text-xs text-muted">
			Response Example
		</div>
		<div
			class="api-request-pre"
			v-html="html"
		/>
	</div>
</template>

<style>
.api-request-pre pre.shiki {
	border: 0 !important;
	border-radius: 0 !important;
	margin: 0 !important;
	max-height: 24rem;
	overflow: auto;
	padding: 0.75rem 1rem;
	background-color: var(--ui-bg-muted) !important;
}

.api-request-pre pre.shiki span {
	color: var(--shiki-light);
	background-color: var(--shiki-light-bg);
}

.dark .api-request-pre pre.shiki span {
	color: var(--shiki-dark);
	background-color: var(--shiki-dark-bg);
}
</style>
