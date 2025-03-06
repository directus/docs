<script setup lang="ts">
import type {DocSearchProps} from "@docsearch/react";
import type {NavItem} from '@nuxt/content';
import type {HeaderLink} from '@nuxt/ui-pro/types';
import type {OpenAPIObject} from 'openapi3-ts/oas30';
import {withoutBaseUrl} from 'ufo';

const navigation = inject<NavItem[]>('navigation', []);
const oasSpec = inject<OpenAPIObject>('openapi', {openapi: '3.0', info: {title: 'OAS Spec', version: '0'}, paths: {}});

const {metaSymbol} = useShortcuts();

const {header, search} = useAppConfig();
const route = useRoute();
const router = useRouter();

const links = computed(() =>
	header.nav.map((link: HeaderLink) => {
		if (link.children) {
			link.active = link.children.some((child: HeaderLink) => {
				const prefix = '/' + (child.to as string).split('/')[1];
				return route.path.startsWith(prefix);
			});
		}

		return link;
	}),
);

const navigationTree = computed(() => {
	if (route.path.startsWith('/api')) return mapOasNavigation(oasSpec);

	const routePrefix = '/' + route.path.split('/')[1]!;

	return mapContentNavigation(navigation.value.find((item) => {
		return item._path.startsWith(routePrefix);
	})?.children ?? []);
});

const isSpecialClick = (event: MouseEvent) =>
	event.button === 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

const withoutBaseUrl = (url: string) => {
	const { app } = useRuntimeConfig()
	const routerBase = withoutTrailingSlash(app.baseURL)
	const hasBaseURL = routerBase !== '/'

	if (hasBaseURL && url.startsWith(routerBase)) {
		return url.substring(routerBase.length) || '/'
	}
	return url
}

// This is needed until https://github.com/nuxt-modules/algolia/issues/208 is resolved
const algoliaHitComponent: DocSearchProps['hitComponent'] = ({hit, children}) => {
	return {
		type: 'a',
		constructor: undefined,
		__v: 1,
		props: {
			href: hit.url,
			children,
			onClick: (event: MouseEvent) => {
				if (isSpecialClick(event)) {
					return
				}

				// We rely on the native link scrolling when user is
				// already on the right anchor because Vue Router doesn't
				// support duplicated history entries.
				if (route.fullPath === hit.url) {
					return
				}

				if (hit.url.startsWith('https://')) {
					navigateTo(hit.url)
				} else {
					const {pathname: hitPathname} = new URL(window.location.origin + hit.url)

					// If the hits goes to another page, we prevent the native link behavior
					// to leverage the Vue Router loading feature.
					if (route.path !== hitPathname) {
						event.preventDefault()
					}

					router.push(withoutBaseUrl(hit.url))
				}
			}
		}
	} as any
</script>

<template>
	<UHeader
		:links="links"
		:ui="route.path.startsWith('/api') ? { container: 'max-w-screen' } : {}"
	>
		<template #logo>
			<LogoDocs class="w-auto h-8 shrink-0"/>
		</template>

		<template #right>
			<ClientOnly v-if="search.backend === 'algolia'">
				<UTooltip
					text="Search"
					:shortcuts="[metaSymbol, 'K']"
					:popper="{ strategy: 'absolute' }"
				>
					<UButton
						icon="heroicons:magnifying-glass-20-solid"
						class="relative"
						truncate
						variant="ghost"
						color="gray"
						square
					>
						<AlgoliaDocSearch :transform-items="transformAlgoliaSearchItems" :hit-component="algoliaHitComponent"/>
					</UButton>
				</UTooltip>
			</ClientOnly>

			<UTooltip
				v-if="search.backend === 'nuxt'"
				text="Search"
				:shortcuts="[metaSymbol, 'K']"
				:popper="{ strategy: 'absolute' }"
			>
				<UContentSearchButton :label="null"/>
			</UTooltip>

			<UColorModeButton class="hidden lg:inline-flex"/>

			<UDivider
				orientation="vertical"
				:ui="{
					border: {
						vertical: 'h-8 mx-2',
					},
				}"
			/>

			<UButton
				v-for="(link, index) of header.links"
				:key="index"
				class="hidden lg:flex"
				v-bind="{ color: 'gray', variant: 'ghost', ...link }"
			/>
		</template>

		<template #panel>
			<UNavigationTree
				:links="header.nav"
				:multiple="false"
				default-open
			/>
			<template v-if="route.path !== '/'">
				<UDivider
					type="dashed"
					class="my-4"
				/>
				<UNavigationTree
					:links="navigationTree"
					:multiple="false"
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
