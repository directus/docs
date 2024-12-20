<script setup lang="ts">
import type { NavItem } from '@nuxt/content';
import type { HeaderLink } from '@nuxt/ui-pro/types';
import type { OpenAPIObject } from 'openapi3-ts/oas30';

const navigation = inject<NavItem[]>('navigation', []);
const oasSpec = inject<OpenAPIObject>('openapi', { openapi: '3.0', info: { title: 'OAS Spec', version: '0' }, paths: {} });

const { metaSymbol } = useShortcuts();

const { header } = useAppConfig();
const route = useRoute();

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
	return mapContentNavigation(navigation);
});
</script>

<template>
	<UHeader
		:links="links"
		:ui="route.path.startsWith('/api') ? { container: 'max-w-screen' } : {}"
	>
		<template #logo>
			<LogoDocs class="w-auto h-8 shrink-0" />
		</template>

		<template #right>
			<UTooltip
				text="Search"
				:shortcuts="[metaSymbol, 'K']"
				:popper="{ strategy: 'absolute' }"
			>
				<UContentSearchButton :label="''" />
			</UTooltip>

			<UColorModeButton class="hidden lg:inline-flex" />

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
			<UNavigationTree :links="header.nav" />
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
	</UHeader>
</template>
