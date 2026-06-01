import '@nuxt/content';

declare module '@nuxt/content' {
	interface ContentNavigationItem {
		icon?: string;
		description?: string;
	}
}

export {};
