import type { RouterConfig } from '@nuxt/schema';
import { useMutationObserver } from '@vueuse/core';
import { nextTick } from 'vue';

export const scrollPositions = new Map<string, number>();

function getHashTarget(hash: string): HTMLElement | null {
	const id = decodeURIComponent(hash.replace(/^#/, ''));
	return document.getElementById(id) ?? document.querySelector(hash) as HTMLElement | null;
}

function scrollToHash(scroller: HTMLElement | null, hash: string): boolean {
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

function scrollToHashWhenReady(scroller: HTMLElement | null, hash: string) {
	if (scrollToHash(scroller, hash)) return;

	const root = scroller ?? document.body;
	const { stop } = useMutationObserver(root, () => {
		if (window.location.hash !== hash || !scrollToHash(scroller, hash)) return;
		stop();
		window.clearTimeout(timeout);
	}, { childList: true, subtree: true });
	const timeout = window.setTimeout(stop, 3000);
}

export default <RouterConfig>{
	scrollBehavior: async (to, from, savedPosition) => {
		const scroller = document.getElementById('docs-scroll');
		const scrollTarget = scroller ?? window;

		if (savedPosition) {
			const key = window.history.state?.key as string | undefined;
			const top = key ? (scrollPositions.get(key) ?? 0) : 0;
			await nextTick();
			scrollTarget.scrollTo({ top, left: 0 });
			return;
		}

		if (to.hash) {
			await nextTick();
			scrollToHashWhenReady(scroller, to.hash);
			return false;
		}

		if (to.path !== from.path) {
			await nextTick();
			scrollTarget.scrollTo(0, 0);
		}
	},
};
