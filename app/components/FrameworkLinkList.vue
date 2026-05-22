<script setup lang="ts">
defineProps<{
	items: Array<{ title: string; description?: string; path: string }>;
}>();
</script>

<template>
	<ul class="divide-y divide-default rounded-lg border border-default">
		<li
			v-for="item in items"
			:key="item.path"
			class="p-4 transition hover:bg-muted/50"
		>
			<NuxtLink
				:to="item.path"
				class="group flex items-start justify-between gap-4"
			>
				<span>
					<span class="font-semibold text-highlighted group-hover:text-primary">
						{{ item.title }}
					</span>
					<span
						v-if="item.description"
						class="mt-1 block text-sm text-muted"
					>
						{{ item.description }}
					</span>
				</span>
				<Icon
					name="i-ph-arrow-right"
					class="mt-1 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
				/>
			</NuxtLink>
		</li>
	</ul>
</template>
