import { scrollToHashWhenReady } from '~/router.options';

export default defineNuxtPlugin((nuxtApp) => {
	const route = useRoute();

	const scrollToRouteHash = async () => {
		if (!route.hash) return;
		await nextTick();
		scrollToHashWhenReady(route.hash);
	};

	nuxtApp.hook('app:mounted', scrollToRouteHash);
	nuxtApp.hook('page:finish', scrollToRouteHash);
	watch(() => route.fullPath, scrollToRouteHash, { flush: 'post' });
});
