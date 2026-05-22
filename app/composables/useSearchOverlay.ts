import { createSharedComposable } from '@vueuse/core';

export const useSearchOverlay = createSharedComposable(() => {
	function open() {
		if (!import.meta.client) return;
		document.querySelector<HTMLButtonElement>('#docsearch .DocSearch-Button')?.click();
	}

	return { open };
});
