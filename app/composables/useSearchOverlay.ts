import { createSharedComposable } from '@vueuse/core';
import { LazyDocsSearchPalette } from '#components';

export const useSearchOverlay = createSharedComposable(() => {
	const overlay = useOverlay();
	return overlay.create(LazyDocsSearchPalette);
});
