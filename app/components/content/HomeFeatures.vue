<script setup lang="ts">
const features = [
	{ title: 'Instant APIs', description: 'REST, GraphQL, and SDKs out of the box.', icon: 'i-lucide-code' },
	{ title: 'Flexible data modeling', description: 'Design your data exactly how you need it.', icon: 'i-lucide-boxes' },
	{ title: 'Permissions baked in', description: 'Granular access control at every level.', icon: 'i-lucide-shield-check' },
	{ title: 'Extensions', description: 'Extend and customize anything.', icon: 'i-lucide-puzzle' },
	{ title: 'Automations', description: 'Automate tasks and business logic with Flows.', icon: 'i-lucide-zap' },
	{ title: 'Dashboards', description: 'Visualize data with Insights panels.', icon: 'i-lucide-chart-column' },
];
</script>

<template>
	<div class="not-prose mt-5 grid grid-cols-1 gap-x-8 gap-y-5 @min-[48rem]/docs-pane:grid-cols-2 @min-[64rem]/docs-pane:grid-cols-3">
		<div
			v-for="f in features"
			:key="f.title"
			class="flex items-start gap-3.5"
		>
			<div class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
				<UIcon
					:name="f.icon"
					class="size-5"
				/>
			</div>
			<div>
				<p class="text-base font-semibold text-highlighted">
					{{ f.title }}
				</p>
				<p class="mt-0.5 text-sm leading-snug text-muted">
					{{ f.description }}
				</p>
			</div>
		</div>
	</div>
</template>
