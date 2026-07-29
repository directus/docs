<script setup lang="ts">
import type { TocLink } from '@nuxt/content';
import { useScrollShadow } from '@nuxt/ui/composables';

const props = defineProps<{
	links: TocLink[] | undefined;
	authors: { name: string; title: string }[] | undefined;
	file: string;
	mobile?: boolean;
}>();

const { toc } = useAppConfig();

const tocRef = useTemplateRef<{ $el: HTMLElement } | null>('tocRef');
const tocEl = computed(() => {
	if (props.mobile) return null;
	const el = tocRef.value?.$el;
	return typeof HTMLElement !== 'undefined' && el instanceof HTMLElement ? el : null;
});
const { style: scrollShadowStyle } = useScrollShadow(tocEl, { size: 48 });

const communityLinks = computed(() => {
	return [
		{
			icon: 'i-lucide-file-pen-line',
			label: 'Edit this page',
			to: `https://github.com/directus/docs/edit/main/${props.file}`,
		},
		...toc.links,
	];
});
</script>

<template>
	<UContentToc
		ref="tocRef"
		:title="toc.title"
		:links="links"
		:default-open="mobile"
		:style="mobile ? undefined : scrollShadowStyle"
		:ui="mobile
			? { root: '!static !top-auto !max-h-none !mx-0 !px-0 !overflow-visible !bg-transparent', container: '!pt-0 !pb-0 !border-0' }
			: { root: 'docs-toc-sticky scrollbar-thin', title: 'font-mono text-xs font-medium tracking-widest text-dimmed uppercase' }"
	>
		<template #bottom>
			<div :class="mobile ? '' : 'docs-toc-bottom'">
				<USeparator
					type="dashed"
					class="mb-5"
				/>

				<template v-if="authors">
					<div>
						<p class="text-xs font-medium truncate font-mono uppercase text-dimmed tracking-widest">
							Written by
						</p>
						<ul class="space-y-3">
							<li
								v-for="author in authors"
								:key="author.name"
								class="text-sm/6 text-gray-500 dark:text-gray-400 mt-2"
							>
								<span class="font-semibold">{{ author.name }}</span><br>{{ author.title }}
							</li>
						</ul>
					</div>
					<USeparator
						type="dashed"
						class="my-5"
					/>
				</template>

				<template v-if="toc.feedback">
					<DocsTocFeedback />
					<USeparator
						type="dashed"
						class="my-5"
					/>
				</template>

				<UPageLinks :links="communityLinks" />
			</div>
		</template>
	</UContentToc>
</template>

<style>
/*
 * Right-rail TOC styling — only active when the docs-pane is wide enough that
 * <DocsPage> renders the right column (≥64rem container query).
 */
.docs-toc-bottom {
	display: none;
}

@container docs-pane (min-width: 64rem) {
	.docs-toc-sticky {
		top: calc(var(--ui-header-height) + var(--ui-subnav-height)) !important;
		max-height: calc(100vh - var(--ui-header-height) - var(--ui-subnav-height) - var(--ui-banner-height, 0px)) !important;
	}

	.docs-toc-bottom {
		display: block;
	}
}
</style>
