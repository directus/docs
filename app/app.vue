<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import { SplitPanel } from '@directus/vue-split-panel';
import { useLocalStorage, useWindowSize } from '@vueuse/core';

const { data: navigation } = useAsyncData('content-navigation', () => queryCollectionNavigation('content', ['title', 'description', 'icon', 'links', 'page']));

provide('navigation', navigation as Ref<ContentNavigationItem[]>);

defineOgImage('Default', {
	title: 'Directus Docs',
});

const assistantEnabled = useRuntimeConfig().public.assistant?.enabled;
const { isOpen } = useAssistant();
const { width: windowWidth } = useWindowSize();

const panelSize = useLocalStorage('assistant-panel-size', 360);
// Cap panel width so the docs pane never shrinks below 40rem (640px) — the
// mobile-shell threshold. Falls back to 320 on viewports too narrow to honor it.
const maxPanelSize = computed(() => Math.max(320, Math.min(720, windowWidth.value - 640)));
const canUseSplitPanel = computed(() => Boolean(assistantEnabled));
const collapsed = computed({
	get: () => !isOpen.value,
	set: (v: boolean) => { isOpen.value = !v; },
});
const splitUi = {
	start: 'min-w-0 overflow-hidden!',
	divider: 'z-30 cursor-col-resize touch-none overflow-visible',
	end: 'min-w-0 overflow-hidden!',
};

watch(maxPanelSize, (size) => {
	panelSize.value = Math.min(Math.max(panelSize.value, 320), size);
}, { immediate: true });

if (import.meta.client) {
	const router = useRouter();

	function getHashTarget(hash: string) {
		const id = decodeURIComponent(hash.replace(/^#/, ''));
		return document.getElementById(id) ?? document.querySelector(hash) as HTMLElement | null;
	}

	function scrollToHash(hash: string) {
		const scroller = document.getElementById('docs-scroll');
		const target = getHashTarget(hash);
		if (!target) return false;

		if (scroller) {
			scroller.scrollTo({ top: Math.max(0, target.offsetTop - 80), behavior: 'smooth' });
		}
		else {
			window.scrollTo({ top: Math.max(0, target.offsetTop - 80), behavior: 'smooth' });
		}
		return true;
	}

	router.options.scrollBehavior = async (to, from, savedPosition) => {
		const scroller = document.getElementById('docs-scroll');
		const scrollTarget = scroller ?? window;

		if (savedPosition) {
			scrollTarget.scrollTo(savedPosition.left ?? 0, savedPosition.top ?? 0);
			return;
		}

		if (to.hash) {
			await nextTick();
			requestAnimationFrame(() => scrollToHash(to.hash));
			return false;
		}

		if (to.path !== from.path) {
			await nextTick();
			scrollTarget.scrollTo(0, 0);
		}
	};
}
</script>

<template>
	<UApp>
		<NuxtLoadingIndicator color="var(--color-primary)" />

		<div
			v-if="canUseSplitPanel"
			class="fixed inset-0 flex flex-col"
		>
			<SplitPanel
				v-model:size="panelSize"
				v-model:collapsed="collapsed"
				:ui="splitUi"
				primary="end"
				size-unit="px"
				:min-size="320"
				:max-size="maxPanelSize"
				:snap-points="[360]"
				:snap-threshold="24"
				:collapse-threshold="40"
				:collapsed-size="0"
				:transition-duration="200"
				divider-hit-area="12px"
				collapsible
				class="flex-1 min-h-0 min-w-0"
			>
				<template #start>
					<div
						id="docs-scroll"
						class="h-full min-w-0 overflow-y-auto overflow-x-hidden scroll-smooth"
					>
						<DocsShell />
					</div>
				</template>
				<template #divider>
					<div class="relative z-30 h-full w-px cursor-col-resize touch-none bg-border transition-colors after:absolute after:inset-y-0 after:-left-2 after:-right-2 after:z-30 after:cursor-col-resize after:content-[''] hover:bg-primary" />
				</template>
				<template #end>
					<AssistantChatBody v-if="isOpen" />
				</template>
			</SplitPanel>
		</div>

		<DocsShell v-else />

		<AssistantFloatingInput v-if="assistantEnabled" />
	</UApp>
</template>
