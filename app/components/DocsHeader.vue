<script setup lang="ts">
import type { DocSearchProps } from '@docsearch/react';
import type { ContentNavigationItem } from '@nuxt/content';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { withoutTrailingSlash } from 'ufo';

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')!;
const oasSpec = inject<OpenAPIObject>('openapi', { openapi: '3.0', info: { title: 'OAS Spec', version: '0' }, paths: {} });

const { header, search } = useAppConfig();
const route = useRoute();
const router = useRouter();

const links = computed(() =>
	header.nav.map((link: typeof header.nav[0] & { active?: boolean }) => {
		if (link.children) {
			link.active = link.children.some((child: any) => {
				const prefix = '/' + (child.to as string).split('/')[1];
				return route.path.startsWith(prefix);
			});
		}

		return link;
	}),
);

const mobileLinks = computed(() => {
	return header.nav.map((link) => {
		// Transform the header nav structure from app.config.ts to ContentNavigationItem format
		const navItem: any = {
			title: link.label,
			path: link.to || '#',
		};

		// Add 'to' property if it exists
		if (link.to) {
			navItem.to = link.to;
		}

		// Transform children if they exist
		if (link.children) {
			navItem.children = link.children.map(child => ({
				title: child.label,
				path: child.to || '#',
				to: child.to,
				icon: child.icon,
			}));
		}

		return navItem;
	});
});

const mobileNavigationTree = computed(() => {
	if (route.path.startsWith('/api')) return mapOasNavigation(oasSpec);

	const routePrefix = `/${route.path.split('/')[1]}`;

	return navigation.value.find((item) => {
		return item.path.startsWith(routePrefix);
	})?.children ?? [];
});

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

// This is needed until https://github.com/nuxt-modules/algolia/issues/208 is resolved
const algoliaHitComponent: DocSearchProps['hitComponent'] = ({ hit, children }: { hit: any; children: any }) => {
	return {
		type: 'a',
		constructor: undefined,
		__v: 1,
		props: {
			href: hit.url,
			children,
			onClick: (event: MouseEvent) => {
				if (isSpecialClick(event)) {
					return;
				}

				// We rely on the native link scrolling when user is
				// already on the right anchor because Vue Router doesn't
				// support duplicated history entries.
				if (route.fullPath === hit.url) {
					return;
				}

				if (hit.url.startsWith('https://')) {
					// don't prevent native navigation
				}
				else {
					const { pathname: hitPathname } = new URL(window.location.origin + hit.url);

					// If the hits goes to another page, we prevent the native link behavior
					// to leverage the Vue Router loading feature.
					if (route.path !== hitPathname) {
						event.preventDefault();
					}

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
		// Vue Router doesn't handle same-page navigation so we use
		// the native browser location API for anchor navigation.
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
	<UHeader>
		<template #top>
			<DocsBanner />
		</template>

		<template #title>
			<LogoDocs class="w-auto h-8 shrink-0" />
		</template>

		<UNavigationMenu
			:items="links"
			orientation="horizontal"
		/>

		<template #right>
			<ClientOnly v-if="search.backend === 'algolia'">
				<UButton
					icon="heroicons:magnifying-glass-20-solid"
					class="relative"
					variant="subtle"
					color="primary"
				>
					<span class="hidden sm:inline">
						Search ⌘K
					</span>
					<AlgoliaDocSearch
						:transform-items="transformAlgoliaSearchItems"
						:hit-component="algoliaHitComponent"
						:navigator="algoliaNavigator"
					/>
				</UButton>
			</ClientOnly>

			<UColorModeButton class="hidden lg:inline-flex" />

			<template v-if="header.links.length">
				<USeparator
					orientation="vertical"
					class="h-8"
				/>
				<UButton
					v-for="(link, index) of header.links"
					:key="index"
					class="hidden lg:flex"
					v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
				/>
			</template>
		</template>

		<!-- For mobile, we use the content navigation -->
		<template #body>
			<UContentNavigation
				:navigation="mobileLinks"
				highlight
				default-open
			/>
			<template v-if="route.path !== '/'">
				<USeparator
					type="dashed"
					class="my-4"
				/>
				<UContentNavigation
					:navigation="mobileNavigationTree"
					highlight
					default-open
				/>
			</template>
		</template>
	</UHeader>
</template>

<style>
#docsearch {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

body .DocSearch-Button {
	all: unset;
	position: relative;
	width: 100%;
	height: 100%;
}

body .DocSearch-Button:hover {
	all: unset;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

body .DocSearch-Button > * {
	display: none !important;
}
</style>
