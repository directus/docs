<script setup lang="ts">
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
	icon?: string;
	libraryValue?: string;
}

const samples = computed<Sample[]>(() => {
	const customSamples = props.samples ?? [];
	const result: Sample[] = [];

	const sdk = customSamples.find(s => getLibraryByLabel(s.label)?.label === 'SDK');
	if (sdk) {
		const lib = getLibraryByLabel(sdk.label);
		result.push({ label: sdk.label, html: sdk.html, icon: lib?.icon, libraryValue: lib?.value });
	}

	const restLib = getLibraryByLabel('REST');
	result.push({
		label: 'REST',
		html: props.restHtml,
		icon: restLib?.icon,
		libraryValue: restLib?.value,
	});

	for (const sample of customSamples) {
		if (sample === sdk) continue;
		const lib = getSampleOptionByLabel(sample.label);
		result.push({ label: sample.label, html: sample.html, icon: lib?.icon, libraryValue: lib?.value });
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

const activeIcon = computed(() => items.value.find(i => i.value === active.value)?.icon);
</script>

<template>
	<div class="dark border border-default rounded-md overflow-hidden bg-default">
		<div class="flex items-center justify-between gap-3 px-3 py-2 border-b border-default bg-elevated">
			<div class="flex items-center gap-2 font-mono text-xs min-w-0">
				<span :class="['method', method.toLowerCase()]">{{ method.toUpperCase() }}</span>
				<span class="text-muted truncate">{{ path }}</span>
			</div>
			<USelect
				v-model="active"
				:items="items"
				:icon="activeIcon"
				size="xs"
				variant="ghost"
				class="shrink-0 lib-select"
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

<style scoped>
.method {
	font-weight: 600;
}
.method.get { color: var(--color-success); }
.method.post { color: var(--color-primary); }
.method.put { color: var(--color-warning); }
.method.patch { color: var(--color-warning); }
.method.delete { color: var(--color-error); }
.method.options { color: var(--color-info); }
.method.head { color: var(--color-info); }

.lib-select :deep(button > [data-slot="leading"]) {
	margin-left: auto;
}
</style>

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
