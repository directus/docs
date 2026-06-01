import { createSharedComposable } from '@vueuse/core';
import { LazySettingsDrawer } from '#components';

export const useSettingsOverlay = createSharedComposable(() => {
	const overlay = useOverlay();
	return overlay.create(LazySettingsDrawer);
});
