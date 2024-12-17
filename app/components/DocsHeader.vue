<script setup lang="ts">
import type { NavItem } from "@nuxt/content";
import type { HeaderLink } from "@nuxt/ui-pro/types";

const navigation = inject<NavItem[]>("navigation", []);
const { metaSymbol } = useShortcuts();

const { header } = useAppConfig();
const route = useRoute();

const links = computed(() =>
	header.nav.map((link: HeaderLink) => {
		if (typeof link.to === "string") {
			link.active = route.path.startsWith(link.to);
		}

		return link;
	})
);
</script>

<template>
	<UHeader :links="links">
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
			<UNavigationTree
				:links="mapContentNavigation(navigation)"
				:multiple="false"
				default-open
			/>
		</template>
	</UHeader>
</template>
