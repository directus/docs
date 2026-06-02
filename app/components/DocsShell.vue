<script setup lang="ts">
const { groupSections } = useSectionNavigation({ immediate: true });

const subNavItems = computed(() =>
	groupSections.value.map(section => ({
		label: section.label,
		to: section.to,
		icon: section.icon,
		active: section.active,
	})),
);

const showSubNav = computed(() => subNavItems.value.length > 1);
</script>

<template>
	<div class="@container/docs-pane min-w-0">
		<div
			class="docs-pane min-w-0"
			:class="{ 'docs-pane--has-subnav': showSubNav }"
		>
			<DocsBanner />
			<DocsHeader />
			<DocsSubNav
				:items="subNavItems"
				:show="showSubNav"
			/>
			<main class="min-h-[calc(100vh-var(--ui-header-height))]">
				<NuxtLayout>
					<NuxtPage />
				</NuxtLayout>
			</main>
			<DocsFooter />
		</div>
	</div>
</template>
