import formatTitle from '@directus/format-title';

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive('title', {
		mounted(el) {
			el.textContent = formatTitle(el.textContent);
		},
		updated(el) {
			el.textContent = formatTitle(el.textContent);
		},
	});
});
