<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo';
import transformAlgoliaSearchItems from '~/utils/transformAlgoliaSearchItems';

const route = useRoute();
const router = useRouter();

const isSpecialClick = (event: MouseEvent) =>
	event.button === 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

const withoutBaseUrl = (url: string) => {
	const { app } = useRuntimeConfig();
	const routerBase = withoutTrailingSlash(app.baseURL);
	const hasBaseURL = routerBase !== '/';

	if (hasBaseURL && url.startsWith(routerBase)) {
		return url.substring(routerBase.length) || '/';
	}
	return url;
};

const algoliaHitComponent = ({ hit, children }: { hit: any; children: any }) => {
	return {
		type: 'a',
		constructor: undefined,
		__v: 1,
		props: {
			href: hit.url,
			children,
			onClick: (event: MouseEvent) => {
				if (isSpecialClick(event)) return;
				if (route.fullPath === hit.url) return;

				if (!hit.url.startsWith('https://')) {
					const { pathname: hitPathname } = new URL(window.location.origin + hit.url);
					if (route.path !== hitPathname) event.preventDefault();
					router.push(withoutBaseUrl(hit.url));
				}
			},
		},
	} as any;
};

const algoliaNavigator = {
	navigate: ({ itemUrl }: { itemUrl: string }) => {
		const isAbsoluteUrl = itemUrl.startsWith('https://');
		const { pathname: hitPathname } = new URL(isAbsoluteUrl ? itemUrl : window.location.origin + itemUrl);
		if (route.path === hitPathname) {
			window.location.assign(window.location.origin + itemUrl);
		}
		else if (isAbsoluteUrl) {
			navigateTo(itemUrl, { external: true });
		}
		else {
			router.push(withoutBaseUrl(itemUrl));
		}
	},
};
</script>

<template>
	<ClientOnly>
		<UButton
			icon="material-symbols:search"
			color="neutral"
			variant="ghost"
			aria-label="Search documentation"
			class="docs-search-trigger relative"
		>
			<span class="hidden @min-[64rem]/docs-pane:inline">
				Search
			</span>
			<kbd class="hidden @min-[64rem]/docs-pane:inline rounded border border-default bg-muted px-1.5 py-0.5 font-mono text-xs text-muted">⌘K</kbd>
			<AlgoliaDocSearch
				:transform-items="transformAlgoliaSearchItems"
				:hit-component="algoliaHitComponent"
				:navigator="algoliaNavigator"
			/>
		</UButton>
	</ClientOnly>
</template>

<style>
.docs-search-trigger #docsearch {
	position: absolute;
	inset: 0;
}

.docs-search-trigger .DocSearch-Button {
	all: unset;
	position: absolute;
	inset: 0;
	cursor: pointer;
}

.docs-search-trigger .DocSearch-Button > * {
	display: none !important;
}
</style>
