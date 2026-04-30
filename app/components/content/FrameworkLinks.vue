<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

const navigation = inject('navigation') as Ref<ContentNavigationItem[]> | undefined;

const frameworks = computed(() => {
	const root = findNavNode(navigation?.value, '/frameworks');
	return (root?.children ?? [])
		.filter(item => item.path && item.path !== '/frameworks')
		.map(item => ({
			label: item.title,
			path: item.path,
			icon: (item as { icon?: string }).icon,
		}));
});
</script>

<template>
	<div class="not-prose grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 my-5">
		<NuxtLink
			v-for="framework in frameworks"
			:key="framework.path"
			:to="framework.path"
			class="group flex items-center gap-3 rounded-lg border border-default p-3 transition hover:bg-primary/5 hover:ring hover:ring-primary"
		>
			<Icon
				v-if="framework.icon"
				:name="framework.icon"
				class="size-5 shrink-0 text-muted group-hover:text-primary"
			/>
			<span class="text-sm font-semibold text-highlighted group-hover:text-primary">
				{{ framework.label }}
			</span>
		</NuxtLink>
	</div>
</template>
