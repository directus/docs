<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import { withBase, withoutBase } from 'ufo';
import { createReusableTemplate, useMediaQuery } from '@vueuse/core';
import { relativeTime } from '~/utils/relativeTime';
import type { DocsSearchItem } from '~/utils/searchResults';
import { sectionPriority } from '~/utils/searchResults';
import type { DocsSectionId } from '#shared/utils/docsSections';
import { docsSections, findSectionByPath } from '#shared/utils/docsSections';
import { createSafePolygon } from '~/utils/safePolygon';

const [DefinePaletteBody, ReusePaletteBody] = createReusableTemplate();
const isDesktop = useMediaQuery('(min-width: 640px)');

const open = defineModel<boolean>('open', { default: false });
const emit = defineEmits<{ close: [] }>();

const route = useRoute();
const router = useRouter();
const { app } = useRuntimeConfig();
const search = useDocsSearch();
const { recents, favorites } = usePageHistory();

const paletteGroups = computed(() => {
	if (searchTerm.value && search && search.items.value.length > 0) {
		const groups: Array<Record<string, unknown>> = [{
			id: 'results',
			ignoreFilter: true,
			items: search.items.value.map(item => ({
				...item,
				onSelect: () => {
					void navigateToResult(item.to);
				},
			})),
		}];
		return groups;
	}

	if (searchTerm.value) return [];

	// Idle state: render as palette groups with per-group slots so arrow keys + enter work natively.
	// Each group's first item is a disabled "header" item rendered via a per-item slot. Reka skips
	// [data-disabled] items in keyboard nav, so ↑↓ walks only real rows.
	const groups: Array<{ id: string; slot?: string; ignoreFilter?: boolean; ui?: Record<string, string>; items: Array<Record<string, unknown>> }> = [];

	const currentPath = route.path;
	const visibleRecents = recents.value.filter(r => r.path !== currentPath).slice(0, 6);
	const visibleFavorites = favorites.value.filter(f => f.path !== currentPath);

	if (visibleRecents.length) {
		groups.push({
			id: 'recents',
			slot: 'recent' as const,
			ignoreFilter: true,
			items: [
				{
					id: 'header:recents',
					slot: 'group-header',
					disabled: true,
					headerIcon: 'i-ph-clock-counter-clockwise',
					headerIconClass: 'size-3.5 opacity-60',
					headerLabel: 'Recently viewed',
					headerCount: visibleRecents.length,
					ui: { item: 'p-0 sm:p-0 opacity-100 cursor-default before:hidden hover:bg-transparent' },
				},
				...visibleRecents.map((r) => {
					const section = findSectionByPath(r.path);
					return {
						id: `recent:${r.path}`,
						to: r.path,
						label: r.title,
						path: r.path,
						visitedAt: r.visitedAt,
						icon: section?.icon ?? 'i-ph-file-text',
						sectionLabel: section?.label ?? '',
						onSelect: () => {
							void navigateToResult(r.path);
						},
					};
				}),
			],
		});
	}

	if (visibleFavorites.length) {
		groups.push({
			id: 'favorites',
			slot: 'favorite' as const,
			ignoreFilter: true,
			items: [
				{
					id: 'header:favorites',
					slot: 'group-header',
					disabled: true,
					headerIcon: 'i-ph-star-fill',
					headerIconClass: 'size-3.5 text-warning',
					headerLabel: 'Favorites',
					headerCount: visibleFavorites.length,
					ui: { item: 'p-0 sm:p-0 opacity-100 cursor-default before:hidden hover:bg-transparent' },
				},
				...visibleFavorites.map((f) => {
					const section = findSectionByPath(f.path);
					return {
						id: `favorite:${f.path}`,
						to: f.path,
						label: f.title,
						path: f.path,
						icon: section?.icon ?? 'i-ph-file-text',
						sectionLabel: section?.label ?? '',
						onSelect: () => {
							void navigateToResult(f.path);
						},
					};
				}),
			],
		});
	}

	groups.push({
		id: 'jump-to',
		slot: 'section' as const,
		ignoreFilter: true,
		items: [
			{
				id: 'header:jump',
				slot: 'group-header',
				disabled: true,
				headerIcon: 'i-ph-compass',
				headerIconClass: 'size-3.5 opacity-60',
				headerLabel: 'Jump to a section',
				muted: true,
				ui: { item: 'p-0 sm:p-0 opacity-100 cursor-default before:hidden hover:bg-transparent' },
			},
			...docsSections.map(s => ({
				id: `section:${s.id}`,
				to: s.to,
				label: s.label,
				icon: s.icon,
				onSelect: () => {
					void navigateToResult(s.to);
				},
			})),
		],
	});

	return groups;
});

const searchTerm = computed({
	get: () => search?.query.value ?? '',
	set: (value: string) => {
		if (search) search.query.value = value;
	},
});

const activeSection = computed({
	get: () => search?.section.value ?? 'all',
	set: (value: 'all' | DocsSectionId) => {
		if (search) search.section.value = value;
	},
});

const sectionCounts = computed(() => search?.sectionCounts.value ?? new Map<DocsSectionId, number>());

const visibleSections = computed(() => {
	if (!searchTerm.value) return [];
	const priorityIds = new Set(sectionPriority.map(p => p.id));
	const ranked = sectionPriority
		.map(p => docsSections.find(s => s.id === p.id))
		.filter((s): s is typeof docsSections[number] => Boolean(s) && sectionCounts.value.has(s!.id));
	const remaining = docsSections.filter(s => !priorityIds.has(s.id) && sectionCounts.value.has(s.id));
	return [...ranked, ...remaining];
});

const sectionIcon = (id: DocsSectionId) =>
	docsSections.find(s => s.id === id)?.icon ?? 'i-ph-file-text';

const isCurrentPage = (to: string) => {
	if (!to) return false;
	const path = to.startsWith('http') ? new URL(to).pathname : to.split('#')[0];
	return path === route.path;
};

const withoutBaseUrl = (url: string) => withoutBase(url, app.baseURL);

async function navigateToResult(url: string) {
	const isAbsoluteUrl = url.startsWith('https://');
	const parsed = new URL(isAbsoluteUrl ? url : window.location.origin + url);
	const nextUrl = parsed.pathname + parsed.hash;

	open.value = false;
	if (route.fullPath === nextUrl) return;
	if (route.path === parsed.pathname) {
		window.location.assign(parsed.pathname + parsed.hash);
		return;
	}
	if (isAbsoluteUrl) {
		await navigateTo(url, { external: true });
		return;
	}
	await router.push(withoutBaseUrl(nextUrl));
}

function openPath(path: string) {
	void navigateToResult(path);
}

function handleClear() {
	searchTerm.value = '';
	void nextTick(() => {
		const root = document.querySelector('.docs-palette');
		const input = root?.querySelector('input') as HTMLInputElement | null;
		input?.focus();
	});
}

const suggestions = [
	{ label: 'API Reference', to: '/api', icon: 'i-ph-code' },
	{ label: 'Guides', to: '/guides/data-model/collections', icon: 'i-ph-book-open' },
	{ label: 'Tutorials', to: '/tutorials', icon: 'i-ph-article' },
];

// Apply scroll shadow to the palette's scrollable viewport.
// We can't ref the viewport directly through UCommandPalette, so query it
// from the DOM once the palette opens, hand it to useScrollShadow, then
// bind the returned style imperatively.
const viewportEl = ref<HTMLElement | null>(null);
const { style: scrollShadowStyle } = useScrollShadow(viewportEl, { size: 24 });

watch(scrollShadowStyle, (style) => {
	if (!viewportEl.value) return;
	const mask = (style as { maskImage?: string } | undefined)?.maskImage;
	viewportEl.value.style.maskImage = mask ?? '';
	viewportEl.value.style.webkitMaskImage = mask ?? '';
});

// Horizontal scroll shadow on the filter chip bar (visible while searching).
const filterChipsEl = useTemplateRef<HTMLElement>('filterChipsEl');
const { style: filterChipsShadowStyle } = useScrollShadow(filterChipsEl, {
	orientation: 'horizontal',
	size: 24,
});

// Preview pane: track the highlighted search result so the side pane can render it.
const highlightedResult = ref<DocsSearchItem | null>(null);
const toast = useToast();
const previewRef = useTemplateRef<ComponentPublicInstance>('previewRef');

// Safe-polygon guard: while the cursor sweeps from a result row toward the
// preview pane, swallow Reka's hover-driven highlight on intermediate rows.
const safePolygon = createSafePolygon(
	() => document.querySelector<HTMLElement>('.docs-palette [data-slot="content"]'),
	() => (previewRef.value?.$el as HTMLElement | null) ?? null,
);

function isSearchItem(value: unknown): value is DocsSearchItem {
	if (!value || typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	return typeof v.id === 'string' && typeof v.to === 'string' && typeof v.title === 'string';
}

function onHighlight(payload: { ref: HTMLElement; value: unknown } | undefined) {
	if (!payload || !isSearchItem(payload.value)) return;
	if (!search?.items.value.some(i => i.id === payload.value.id)) return;
	highlightedResult.value = payload.value;
}

// Capture-phase pointermove: update the polygon BEFORE Reka's row-level
// onPointermove (bubble phase) runs. If we're guarding, stop propagation so
// Reka's per-item handler never fires, leaving Reka's highlightedElement
// untouched. Reka stays the source of truth for both visual highlight and the
// @highlight event; we just selectively block its hover-driven updates.
function onPaletteContentPointerMove(event: PointerEvent) {
	safePolygon.onPointerMove(event);
	if (!safePolygon.isGuarding()) return;
	const target = event.target as HTMLElement | null;
	if (!target?.closest('[role="option"]')) return;
	event.stopImmediatePropagation();
}

// Auto-prime the preview to the first result when results change.
// Also re-resolve the viewport element. UCommandPalette swaps the DOM node
// between the empty/skeleton state and the populated listbox, which would
// otherwise leave useScrollShadow watching a detached node.
watch(() => search?.items.value, async (items) => {
	safePolygon.reset();
	if (!items || items.length === 0) {
		highlightedResult.value = null;
	}
	else {
		const stillValid = highlightedResult.value && items.some(i => i.id === highlightedResult.value!.id);
		if (!stillValid) {
			highlightedResult.value = items[0] ?? null;
		}
	}
	if (!open.value) return;
	await nextTick();
	const next = document.querySelector<HTMLElement>('.docs-palette [data-slot="viewport"]');
	if (next && next !== viewportEl.value) viewportEl.value = next;
});

watch(open, async (value) => {
	if (!value) {
		search?.clear();
		viewportEl.value = null;
		highlightedResult.value = null;
		safePolygon.reset();
		return;
	}
	await nextTick();
	viewportEl.value = document.querySelector<HTMLElement>('.docs-palette [data-slot="viewport"]');
});

// The viewport node is swapped out as the palette transitions between idle,
// empty/skeleton, and populated states. Re-resolve on search-term changes so
// the scroll shadow keeps targeting the live viewport.
watch(searchTerm, async () => {
	if (!open.value) return;
	await nextTick();
	const next = document.querySelector<HTMLElement>('.docs-palette [data-slot="viewport"]');
	if (next && next !== viewportEl.value) viewportEl.value = next;
});

async function copyResultLink() {
	const item = highlightedResult.value;
	if (!item || typeof window === 'undefined') return;
	const isAbsolute = item.to.startsWith('http://') || item.to.startsWith('https://');
	const fullUrl = isAbsolute ? item.to : `${window.location.origin}${withBase(item.to, app.baseURL)}`;
	try {
		await navigator.clipboard.writeText(fullUrl);
		toast.add({ title: 'Link copied', icon: 'i-lucide-check', color: 'success' });
	}
	catch {
		// silent fallback if clipboard API is blocked
	}
}

function openHighlightedResult() {
	const item = highlightedResult.value;
	if (!item) return;
	void navigateToResult(item.to);
}

function cycleSection(direction: 1 | -1) {
	if (!search || !searchTerm.value) return;
	const sections = visibleSections.value;
	if (sections.length === 0) return;
	const ids: ('all' | DocsSectionId)[] = ['all', ...sections.map(s => s.id)];
	const currentIndex = ids.indexOf(activeSection.value);
	const nextIndex = (currentIndex + direction + ids.length) % ids.length;
	activeSection.value = ids[nextIndex]!;
}

function handlePaletteKeydown(event: KeyboardEvent) {
	if (!open.value || !searchTerm.value) return;

	if (event.key !== '[' && event.key !== ']') return;

	event.preventDefault();
	cycleSection(event.key === ']' ? 1 : -1);
}

onMounted(() => {
	window.addEventListener('keydown', handlePaletteKeydown, true);
});

onUnmounted(() => {
	window.removeEventListener('keydown', handlePaletteKeydown, true);
});
</script>

<template>
	<div>
		<DefinePaletteBody>
			<div
				:class="['docs-search-grid', searchTerm && isDesktop ? 'docs-search-grid--split' : '']"
				@pointermove.capture="onPaletteContentPointerMove"
			>
				<UCommandPalette
					v-model:search-term="searchTerm"
					:groups="paletteGroups"
					:loading="search?.pending.value"
					:input="{ fixed: true, placeholder: 'Search the docs…' }"
					:fuse="{ matchAllWhenSearchEmpty: true, fuseOptions: { threshold: 1 } }"
					:ui="{ empty: 'text-left text-default flex-1', root: 'contents', content: 'relative overflow-hidden flex flex-col min-h-0', viewport: 'scrollbar-thin', footer: 'shrink-0 p-0', item: 'p-3 sm:p-2 gap-2 items-center', group: 'p-1.5 isolate' }"
					class="docs-palette"
					@highlight="onHighlight"
				>
					<template #close>
						<div class="flex items-center gap-1.5">
							<UButton
								v-if="searchTerm"
								label="Clear"
								color="primary"
								variant="ghost"
								:size="isDesktop ? 'xs' : 'sm'"
								@click="handleClear"
							/>
							<USeparator
								v-if="searchTerm"
								orientation="vertical"
								class="h-4"
							/>
							<UButton
								icon="i-lucide-x"
								color="neutral"
								variant="ghost"
								:size="isDesktop ? 'xs' : 'md'"
								aria-label="Close search"
								@click="open = false"
							/>
						</div>
					</template>

					<template #item="{ item }">
						<div class="flex items-start gap-3 w-full min-w-0 py-1">
							<UIcon
								:name="sectionIcon(item.section)"
								class="size-4 mt-0.5 shrink-0 text-muted"
							/>
							<div class="min-w-0 flex-1">
								<div
									v-if="item.titleHtml"
									class="truncate font-medium text-sm text-highlighted"
									v-html="item.titleHtml"
								/>
								<div
									v-else
									class="truncate font-medium text-sm text-highlighted"
								>
									{{ item.title }}
								</div>
								<div class="truncate text-xs text-muted mt-0.5">
									<span>{{ item.sectionLabel }}</span>
									<span
										v-if="item.snippetHtml"
										class="mx-1.5 text-default"
									>·</span>
									<span
										v-if="item.snippetHtml"
										class="line-clamp-1 inline"
										v-html="item.snippetHtml"
									/>
								</div>
							</div>
							<UBadge
								v-if="isCurrentPage(item.to)"
								label="Current page"
								color="primary"
								variant="soft"
								size="sm"
								class="shrink-0 self-center"
							/>
							<UIcon
								v-else
								name="i-ph-arrow-right"
								class="size-3.5 text-primary shrink-0 self-center opacity-0 -translate-x-1 transition-all duration-150 group-data-[highlighted]:opacity-100 group-data-[highlighted]:translate-x-0"
							/>
						</div>
					</template>

					<template #recent-leading="{ item }">
						<UIcon
							:name="item.icon"
							class="size-4 text-muted"
						/>
					</template>
					<template #recent-label="{ item }">
						<span class="font-medium text-highlighted truncate">{{ item.label }}</span>
					</template>
					<template #recent-trailing="{ item }">
						<UBadge
							v-if="item.sectionLabel"
							:label="item.sectionLabel"
							color="neutral"
							variant="soft"
							size="sm"
							class="font-mono uppercase tracking-wider"
						/>
						<span
							v-if="item.visitedAt"
							class="text-[0.6875rem] text-muted tabular-nums whitespace-nowrap min-w-6 text-right"
						>
							{{ relativeTime(item.visitedAt) }}
						</span>
						<UIcon
							name="i-ph-arrow-right"
							class="size-3.5 text-dimmed opacity-0 -translate-x-1 transition-all duration-150 group-data-[highlighted]:opacity-100 group-data-[highlighted]:translate-x-0 group-data-[highlighted]:text-primary"
						/>
					</template>

					<template #favorite-leading="{ item }">
						<UIcon
							:name="item.icon"
							class="size-4 text-muted"
						/>
					</template>
					<template #favorite-label="{ item }">
						<span class="font-medium text-highlighted truncate">{{ item.label }}</span>
					</template>
					<template #favorite-trailing="{ item }">
						<UBadge
							v-if="item.sectionLabel"
							:label="item.sectionLabel"
							color="neutral"
							variant="soft"
							size="sm"
							class="font-mono uppercase tracking-wider"
						/>
						<UIcon
							name="i-ph-arrow-right"
							class="size-3.5 text-dimmed opacity-0 -translate-x-1 transition-all duration-150 group-data-[highlighted]:opacity-100 group-data-[highlighted]:translate-x-0 group-data-[highlighted]:text-primary"
						/>
					</template>

					<template #section-leading="{ item }">
						<UIcon
							:name="item.icon"
							class="size-4 text-muted"
						/>
					</template>
					<template #section-label="{ item }">
						<span class="font-medium text-highlighted truncate">{{ item.label }}</span>
					</template>
					<template #section-trailing>
						<UIcon
							name="i-ph-arrow-right"
							class="size-3.5 text-dimmed opacity-0 -translate-x-1 transition-all duration-150 group-data-[highlighted]:opacity-100 group-data-[highlighted]:translate-x-0 group-data-[highlighted]:text-primary"
						/>
					</template>


					<template #group-header="{ item }">
						<header class="flex items-center px-2.5 pt-3 pb-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted">
							<span class="inline-flex items-center gap-2">
								<UIcon
									:name="item.headerIcon"
									:class="item.headerIconClass"
								/>
								{{ item.headerLabel }}
								<UBadge
									v-if="item.headerCount !== undefined"
									:label="String(item.headerCount)"
									color="neutral"
									variant="soft"
									size="sm"
									class="tabular-nums normal-case tracking-normal"
								/>
							</span>
						</header>
					</template>

					<template #empty="{ searchTerm: currentSearchTerm }">
						<!-- Loading skeleton mirrors the structure/spacing of the #item template -->
						<div
							v-if="search?.pending.value && currentSearchTerm"
							class="p-1.5"
						>
							<div
								v-for="n in 3"
								:key="n"
								class="flex items-start gap-3 p-3 sm:p-2"
							>
								<USkeleton class="size-4 mt-0.5 shrink-0" />
								<div class="flex-1 min-w-0 py-1">
									<USkeleton class="h-3.5 w-2/5 min-w-28" />
									<USkeleton class="h-3 w-3/4 mt-1.5" />
								</div>
								<USkeleton class="size-3.5 shrink-0 self-center" />
							</div>
						</div>

						<!-- Query too short -->
						<div
							v-else-if="search?.isTooShort.value"
							class="px-4 text-left"
						>
							<div class="flex items-start gap-3">
								<div class="size-7 rounded-lg flex items-center justify-center text-muted bg-elevated shrink-0">
									<UIcon
										name="i-ph-keyboard"
										class="size-4"
									/>
								</div>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium text-highlighted">
										Type at least {{ search?.minQueryLength }} characters
									</p>
									<p class="text-xs text-muted mt-0.5">
										Keep typing to search the docs.
									</p>
								</div>
							</div>
						</div>

						<!-- No-results state -->
						<div
							v-else-if="currentSearchTerm"
							class="px-4 text-left"
						>
							<div class="flex items-start gap-3">
								<div class="size-7 rounded-lg flex items-center justify-center text-muted bg-elevated shrink-0">
									<UIcon
										name="i-ph-magnifying-glass"
										class="size-4"
									/>
								</div>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium text-highlighted">
										No matches for <span class="text-primary font-semibold">{{ currentSearchTerm }}</span>
									</p>
									<p class="text-xs text-muted mt-0.5">
										Try a broader query, or browse a section below.
									</p>
								</div>
							</div>
							<div class="mt-3 flex flex-wrap gap-1.5 pl-9">
								<UButton
									v-for="suggestion in suggestions"
									:key="suggestion.to"
									:icon="suggestion.icon"
									:label="suggestion.label"
									color="neutral"
									variant="soft"
									size="xs"
									@click="openPath(suggestion.to)"
								/>
							</div>
						</div>
					</template>

					<!-- Footer: keyboard hints (left) + actions on the highlighted result (right) -->
					<template #footer>
						<div
							v-if="isDesktop"
							class="flex items-center gap-3 px-3 py-2 h-full"
						>
							<div class="flex items-center gap-3.5 text-[0.6875rem] text-dimmed flex-1 min-w-0">
								<span class="inline-flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-wider">
									<UKbd value="arrowup" />
									<UKbd value="arrowdown" />
									Navigate
								</span>
								<span class="inline-flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-wider">
									<UKbd value="escape" />
									Close
								</span>
								<span
									v-if="searchTerm"
									class="inline-flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-wider"
								>
									<UKbd>[</UKbd>
									<UKbd>]</UKbd>
									Sections
								</span>
							</div>
							<div
								v-if="searchTerm && highlightedResult"
								class="flex items-center gap-2 shrink-0"
							>
								<UButton
									label="Copy link"
									color="neutral"
									variant="ghost"
									size="sm"
									icon="i-lucide-link"
									@click="copyResultLink"
								/>
								<UButton
									label="Open page"
									color="primary"
									variant="solid"
									size="md"
									@click="openHighlightedResult"
								>
									<template #trailing>
										<UKbd value="enter" />
									</template>
								</UButton>
							</div>
						</div>
					</template>
				</UCommandPalette>

				<div
					v-if="searchTerm"
					class="docs-search-chips flex items-center gap-3 px-2.5 py-1.5 border-b border-default"
				>
					<div
						ref="filterChipsEl"
						class="palette-filter-chips flex flex-nowrap gap-1 flex-1 min-w-0 overflow-x-auto"
						:style="filterChipsShadowStyle"
					>
						<UButton
							size="xs"
							:color="activeSection === 'all' ? 'primary' : 'neutral'"
							:variant="activeSection === 'all' ? 'soft' : 'ghost'"
							class="shrink-0"
							@click="activeSection = 'all'"
						>
							All
							<span class="text-[10px] tabular-nums opacity-70 ms-1">{{ search?.found.value ?? 0 }}</span>
						</UButton>
						<UButton
							v-for="s in visibleSections"
							:key="s.id"
							size="xs"
							:icon="s.icon"
							:color="activeSection === s.id ? 'primary' : 'neutral'"
							:variant="activeSection === s.id ? 'soft' : 'ghost'"
							class="shrink-0"
							@click="activeSection = s.id"
						>
							{{ s.label }}
							<span class="text-[10px] tabular-nums opacity-70 ms-1">{{ sectionCounts.get(s.id) }}</span>
						</UButton>
					</div>
				</div>

				<DocsSearchPreview
					v-if="searchTerm && isDesktop"
					ref="previewRef"
					:result="highlightedResult"
					class="border-default border-b"
					@open="openHighlightedResult"
					@copy-link="copyResultLink"
				/>
			</div>
		</DefinePaletteBody>

		<UModal
			v-if="isDesktop"
			v-model:open="open"
			title="Search docs"
			description="Search docs, API reference, favorites, and recent pages."
			:ui="{ content: 'sm:max-w-4xl h-[85vh] sm:h-[640px] max-h-[85vh]' }"
			@update:open="(value) => { if (!value) emit('close'); }"
		>
			<template #content>
				<ReusePaletteBody />
			</template>
		</UModal>

		<UDrawer
			v-else
			v-model:open="open"
			title="Search docs"
			description="Search docs, API reference, favorites, and recent pages."
			direction="bottom"
			:should-scale-background="false"
			:handle="false"
			:ui="{
				content: 'h-[100dvh] max-h-[100dvh] mt-0 rounded-none',
				container: 'p-0 gap-0 h-full overflow-hidden',
				header: 'sr-only',
				title: 'sr-only',
				description: 'sr-only',
				body: 'p-0 flex flex-col min-h-0 overflow-hidden',
			}"
			@update:open="(value) => { if (!value) emit('close'); }"
		>
			<template #body>
				<ReusePaletteBody />
			</template>
		</UDrawer>
	</div>
</template>

<style scoped>
.palette-filter-chips {
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
}

.palette-filter-chips::-webkit-scrollbar {
	display: none;
}

/* ===== Two-column palette layout: input + footer span full width =====
   The palette root is set to `display: contents` via :ui, so its children
   (input, content, footer) are direct grid items of .docs-search-grid. */
.docs-search-grid {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	grid-template-rows: auto auto 1fr auto;
	flex: 1 1 auto;
	height: 100%;
	min-height: 0;
	min-width: 0;
}

.docs-search-grid--split {
	grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
}

/* UInput is rendered as a direct grid child (because UCommandPalette root uses
   `display: contents`). Override its default inline-flex wrapper so it spans
   both columns of the palette grid, and let the inner <input> fill the bar. */
.docs-search-grid :deep([data-slot="root"]:has(> [data-slot="input"])) {
	grid-column: 1 / -1;
	display: flex;
	width: 100%;
	border-bottom: 1px solid var(--ui-border);
}

.docs-search-grid :deep([data-slot="input"]) {
	width: 100%;
	flex: 1 1 auto;
	border-radius: 0 !important;
}

.docs-search-grid .docs-search-chips {
	grid-column: 1 / -1;
	grid-row: 2;
}

.docs-search-grid :deep([data-slot="content"]) {
	grid-column: 1;
	grid-row: 3;
	min-height: 0;
}

.docs-search-grid :deep([data-slot="footer"]) {
	grid-column: 1 / -1;
	grid-row: 4;
	min-height: 3rem;
	align-items: center;
	border-top: 1px solid var(--ui-border);
}

.docs-search-grid .docs-search-preview {
	grid-column: 2;
	grid-row: 3;
	min-height: 0;
	overflow: hidden;
}

@media (max-width: 639px) {
	.docs-search-grid--split {
		grid-template-columns: 1fr;
	}
}
</style>

<style>
.docs-palette mark {
	background: transparent;
	color: var(--ui-primary);
	font-weight: 600;
	text-decoration: underline;
	text-decoration-color: var(--ui-primary);
	text-decoration-thickness: 1px;
	text-underline-offset: 4px;
	padding: 0;
}
</style>
