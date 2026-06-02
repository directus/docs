<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { getLibraryByLabel, getLibraryByValue, getSampleOptionByLabel } from '~/utils/libraries';
import type { ApiReferenceCodeSample } from '~/types';

const props = defineProps<{
	method: string;
	path: string;
	// Shiki-highlighted HTML for the auto-generated REST sample, precomputed at build time.
	restHtml: string;
	samples?: ApiReferenceCodeSample[];
}>();

const { library, setLibrary } = useUserPreferences();

interface Sample {
	label: string;
	html: string;
	source: string;
	icon?: string;
	libraryValue?: string;
}

const samples = computed<Sample[]>(() => {
	const customSamples = props.samples ?? [];
	const result: Sample[] = [];

	const sdk = customSamples.find(s => getLibraryByLabel(s.label)?.label === 'SDK');
	if (sdk) {
		const lib = getLibraryByLabel(sdk.label);
		result.push({ label: sdk.label, html: sdk.html, source: sdk.source, icon: lib?.icon, libraryValue: lib?.value });
	}

	const restLib = getLibraryByLabel('REST');
	result.push({
		label: 'REST',
		html: props.restHtml,
		source: `${props.method.toUpperCase()} ${props.path}`,
		icon: restLib?.icon,
		libraryValue: restLib?.value,
	});

	for (const sample of customSamples) {
		if (sample === sdk) continue;
		const lib = getSampleOptionByLabel(sample.label);
		result.push({ label: sample.label, html: sample.html, source: sample.source, icon: lib?.icon, libraryValue: lib?.value });
	}

	return result;
});

const items = computed(() =>
	samples.value.map(s => ({
		label: s.label,
		value: s.libraryValue ?? s.label,
		icon: s.icon,
	})),
);

const fallbackValue = computed(() => items.value[0]?.value ?? '');

const localActive = ref(fallbackValue.value);

const active = computed<string>({
	get: () => {
		const current = library.value;
		if (current && items.value.some(i => i.value === current)) return current;
		if (items.value.some(i => i.value === localActive.value)) return localActive.value;
		return fallbackValue.value;
	},
	set: (value: string) => {
		localActive.value = value;
		const lib = getLibraryByValue(value);
		if (lib) setLibrary(lib.value);
	},
});

const activeSample = computed(() =>
	samples.value.find(s => (s.libraryValue ?? s.label) === active.value),
);

const { copy, copied } = useClipboard({ copiedDuring: 2000 });
</script>

<template>
	<div class="dark border border-default rounded-md overflow-hidden bg-default">
		<div class="flex items-center justify-between gap-2 pr-2 border-b border-default bg-elevated">
			<UTabs
				v-model="active"
				:items="items"
				variant="link"
				color="primary"
				size="sm"
				:content="false"
				class="min-w-0 grow"
				:ui="{ list: 'border-b-0 px-3', trigger: 'text-xs' }"
			/>
			<UButton
				:icon="copied ? 'i-material-symbols-check' : 'i-material-symbols-content-copy-outline'"
				color="neutral"
				variant="ghost"
				size="xs"
				:aria-label="copied ? 'Copied' : 'Copy code'"
				class="shrink-0"
				@click="copy(activeSample?.source ?? '')"
			/>
		</div>
		<template v-for="sample of samples" :key="sample.label">
			<div
				v-show="active === (sample.libraryValue ?? sample.label)"
				class="api-request-pre"
				v-html="sample.html"
			/>
		</template>
	</div>
</template>

<style>
/* The code region scrolls on its own if content can't fit, so an overflowing
   sample never widens the panel, pushes the copy button away, or grows the page
   taller than the viewport. The background lives here (not on the pre) so it
   fills the whole scroll area, including space past the wrapped content. */
.api-request-pre {
	max-width: 100%;
	max-height: 400px;
	overflow: auto;
	background-color: var(--ui-bg-muted);
	scrollbar-width: thin;
	scrollbar-color: var(--ui-border-accented) transparent;
}

.api-request-pre::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.api-request-pre::-webkit-scrollbar-thumb {
	background-color: var(--ui-border-accented);
	border-radius: 9999px;
}

.api-request-pre::-webkit-scrollbar-track {
	background: transparent;
}

.api-request-pre pre.shiki {
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

.api-request-pre pre.shiki span {
	color: var(--shiki-light);
	background-color: var(--shiki-light-bg);
}

.dark .api-request-pre pre.shiki span {
	color: var(--shiki-dark);
	background-color: var(--shiki-dark-bg);
}
</style>
