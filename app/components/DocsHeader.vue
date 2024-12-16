<script setup lang="ts">
import type { NavItem } from "@nuxt/content";

const navigation = inject<NavItem[]>("navigation", []);
const { metaSymbol } = useShortcuts();

const { header } = useAppConfig();
</script>

<template>
	<UHeader>
		<template #logo>
			<DocsLogo class="w-auto h-8 shrink-0" />
		</template>

		<template #center>
			<UHeaderLinks class="hidden lg:flex" :links="header.nav" />
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

			<UButton
				v-for="(link, index) of header.links"
				:key="index"
				class="hidden lg:flex"
				v-bind="{ color: 'gray', variant: 'ghost', ...link }"
			/>
		</template>

		<template #panel>
			<UAsideLinks :links="header.nav" />
			<UDivider type="dashed" class="my-4" />
			<UNavigationTree :links="mapContentNavigation(navigation)" :multiple="false" default-open />
		</template>
	</UHeader>
</template>

<style scoped>
/* Your component styles go here */
</style>
