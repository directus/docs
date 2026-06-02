<script setup lang="ts">
const { header } = useAppConfig();

const { groups, allSectionItems } = useSectionNavigation();

const groupItems = computed(() =>
	groups.value.map(group => ({
		label: group.label,
		title: group.label,
		to: group.to,
		path: group.to,
		icon: group.icon,
		active: group.active,
	})),
);
</script>

<template>
	<UHeader mode="drawer">
		<template #title>
			<LogoDocs />
		</template>

		<template #default>
			<UNavigationMenu
				:items="groupItems"
				orientation="horizontal"
				variant="link"

				class="hidden @min-[40rem]/docs-pane:flex"
				:ui="{
					linkLeadingIcon: 'size-4',
					linkTrailingIcon: 'size-4',
				}"
			/>
		</template>

		<template #right>
			<DocsSearchTrigger />
			<div class="block @min-[40rem]/docs-pane:hidden">
				<SettingsDrawerTrigger />
			</div>
			<UColorModeButton
				class="hidden @min-[40rem]/docs-pane:block"
				square
			/>
			<template v-if="header.links.length">
				<USeparator
					orientation="vertical"
					class="h-8"
				/>
				<UButton
					v-for="(link, index) of header.links"
					:key="index"
					class="hidden @min-[40rem]/docs-pane:flex"
					v-bind="{ color: 'neutral', variant: 'ghost', ...link, label: undefined }"
				/>
			</template>
		</template>

		<template #body>
			<div class="flex items-center gap-2 mb-4 pb-4 border-b border-default">
				<UButton
					v-for="(link, index) in header.links"
					:key="index"
					v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
				/>
			</div>
			<UContentNavigation
				:navigation="allSectionItems"
				highlight
				:ui="{ itemWithChildren: 'flex flex-col' }"
			>
				<template #link="{ link, active }">
					<span
						v-if="link.indent"
						class="flex items-center gap-2 w-full -my-1.5 py-3 pl-4 border-l border-default text-base"
						:class="active ? 'text-primary font-medium' : 'text-muted'"
			
					>
						<UIcon v-if="link.icon" :name="link.icon" class="size-4 shrink-0" />
						{{ link.title }}
					</span>
					<span
						v-else
						class="flex items-center gap-2 w-full py-1.5 text-lg font-medium"
						:class="active ? 'text-primary' : 'text-highlighted'"
			
					>
						<UIcon v-if="link.icon" :name="link.icon" class="size-4 shrink-0" />
						{{ link.title }}
					</span>
				</template>
			</UContentNavigation>
		</template>
	</UHeader>
</template>
