<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import { findPageBreadcrumb } from '@nuxt/content/utils';
import type { Ref } from 'vue';
import { withBase } from 'ufo';
import type { DocsSearchItem } from '~/utils/searchResults';
import { docsSections } from '#shared/utils/docsSections';

const props = defineProps<{
	result: DocsSearchItem | null;
}>();

const emit = defineEmits<{
	open: [];
	copyLink: [];
}>();

const previewSnippetEl = useTemplateRef<HTMLElement>('previewSnippetEl');
const { style: previewSnippetShadowStyle } = useScrollShadow(previewSnippetEl, { size: 16 });
const navigation = inject<Ref<ContentNavigationItem[]> | null>('navigation', null);
const { app } = useRuntimeConfig();

const sectionIcon = (id: DocsSearchItem['section']) =>
	docsSections.find(section => section.id === id)?.icon ?? 'i-lucide-file-text';

const previewDisplayPath = computed(() => {
	const to = props.result?.to;
	if (!to) return '';
	const hashIndex = to.indexOf('#');
	const path = hashIndex === -1 ? to : to.slice(0, hashIndex);
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	return withBase(path, app.baseURL);
});

function toContentPath(url: string) {
	if (!url) return '';
	const stripped = url.replace(/^\/docs/, '');
	return stripped || '/';
}

const previewBreadcrumb = computed(() => {
	if (!navigation?.value || !previewDisplayPath.value) return [];
	const contentPath = toContentPath(previewDisplayPath.value);
	const trail = findPageBreadcrumb(navigation.value, contentPath) ?? [];
	return trail.map(item => ({
		label: item.title,
		to: item.path,
	}));
});
</script>

<template>
	<aside class="docs-search-preview hidden sm:flex flex-col min-w-0 min-h-0 border-l border-default bg-muted dark:bg-default">
		<template v-if="result">
			<div class="px-5 pt-4 pb-2">
				<UBreadcrumb
					v-if="previewBreadcrumb.length"
					:items="previewBreadcrumb"
					:ui="{
						root: 'text-xs font-mono font-medium uppercase tracking-wider',
						label: 'text-muted font-medium',
						link: 'text-muted font-medium hover:text-default',
					}"
				>
					<template #separator>
						<span class="mx-1.5 text-dimmed">/</span>
					</template>
				</UBreadcrumb>
				<div
					v-else
					class="flex items-center gap-2 text-xs uppercase tracking-wider text-muted font-mono"
				>
					<UIcon
						:name="sectionIcon(result.section)"
						class="size-3.5 opacity-70"
					/>
					<span>{{ result.sectionLabel }}</span>
				</div>
			</div>
			<div class="px-5 pb-1">
				<h3 class="text-lg font-semibold leading-snug break-words">
					<ULink
						:to="result.to"
						class="text-highlighted hover:text-primary transition-colors"
						@click.prevent="emit('open')"
					>
						{{ result.title }}
					</ULink>
				</h3>
			</div>
			<p
				v-if="result.description"
				class="px-5 pb-3 m-0 text-sm text-muted leading-relaxed"
			>
				{{ result.description }}
			</p>
			<div class="px-5 pb-3">
				<code class="text-xs text-muted font-mono break-all select-all">{{ previewDisplayPath }}</code>
			</div>
			<div
				v-if="!result.description && result.content"
				ref="previewSnippetEl"
				class="docs-search-preview-snippet scrollbar-thin flex-1 overflow-y-auto px-5 pb-4 text-sm text-muted leading-relaxed"
				:style="previewSnippetShadowStyle"
			>
				<p class="m-0">
					{{ result.content }}
				</p>
			</div>
			<div
				v-else
				class="flex-1"
			/>
		</template>
		<div
			v-else
			class="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
		>
			<div class="palette-empty-icon">
				<UIcon
					name="i-lucide-search"
					class="size-4"
				/>
			</div>
			<p class="text-sm text-muted max-w-[18rem]">
				Highlight a result to preview it.
			</p>
		</div>
	</aside>
</template>
