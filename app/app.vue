<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

const { data: navigation } = await useAsyncData('content-navigation', () => queryCollectionNavigation('content', ['title', 'description', 'icon', 'links']));

provide('navigation', navigation as Ref<ContentNavigationItem[]>);

defineOgImage('Default', {
	title: 'Directus Docs',
});

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
			id="docs-scroll"
			class="h-screen min-w-0 overflow-y-auto overflow-x-hidden scroll-smooth"
		>
			<DocsShell />
		</div>
	</UApp>
</template>
