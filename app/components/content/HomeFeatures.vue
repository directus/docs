<script setup lang="ts">
const features = [
	{ title: 'Instant APIs', description: 'REST, GraphQL, and SDKs out of the box.', icon: 'heroicons-outline:code-bracket' },
	{ title: 'Flexible data modeling', description: 'Design your data exactly how you need it.', icon: 'heroicons-outline:cube' },
	{ title: 'Permissions baked in', description: 'Granular access control at every level.', icon: 'heroicons-outline:shield-check' },
	{ title: 'Extensions', description: 'Extend and customize anything.', icon: 'heroicons-outline:puzzle-piece' },
	{ title: 'Automations', description: 'Automate tasks and business logic with Flows.', icon: 'heroicons-outline:bolt' },
	{ title: 'Dashboards', description: 'Visualize data with Insights panels.', icon: 'heroicons-outline:chart-bar' },
];
</script>

<template>
	<div class="home-features not-prose">
		<div
			v-for="f in features"
			:key="f.title"
			class="home-feature"
		>
			<div class="home-feature-icon">
				<UIcon
					:name="f.icon"
					class="size-5"
				/>
			</div>
			<div>
				<p class="home-feature-title">
					{{ f.title }}
				</p>
				<p class="home-feature-description">
					{{ f.description }}
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.home-features {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1.25rem 2rem;
	margin-top: 1.25rem;
}
@media (min-width: 48rem) {
	.home-features { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 64rem) {
	.home-features { grid-template-columns: repeat(3, 1fr); }
}

.home-feature {
	display: flex;
	gap: 0.875rem;
	align-items: flex-start;
}

.home-feature-icon {
	display: grid;
	place-items: center;
	width: 2.25rem;
	height: 2.25rem;
	flex-shrink: 0;
	border-radius: 0.5rem;
	background: color-mix(in oklab, var(--color-primary) 10%, transparent);
	color: var(--color-primary);
}

.home-feature-title {
	font-weight: 600;
	font-size: 0.9375rem;
	color: var(--ui-text-highlighted);
}

.home-feature-description {
	margin-top: 0.125rem;
	font-size: 0.875rem;
	color: var(--ui-text-muted);
	line-height: 1.45;
}
</style>
