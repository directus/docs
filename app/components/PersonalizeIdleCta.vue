<script setup lang="ts">
defineEmits<{ start: []; dismiss: [] }>();
</script>

<template>
	<div class="ip-cta">
		<div class="ip-cta-icon">
			<UIcon
				name="i-ph-sparkle"
				class="size-4"
			/>
		</div>
		<div class="ip-cta-text">
			<p class="ip-cta-title">
				Personalize your docs experience
			</p>
			<p class="ip-cta-sub">
				Tell us your stack and we'll tailor examples, snippets, and search results. No personal info collected.
			</p>
		</div>
		<div class="ip-cta-actions">
			<UButton
				label="Start"
				trailing-icon="i-ph-arrow-right"
				color="primary"
				variant="soft"
				size="sm"
				@click="$emit('start')"
			/>
			<UButton
				icon="i-ph-x"
				color="neutral"
				variant="ghost"
				size="sm"
				aria-label="Dismiss"
				@click="$emit('dismiss')"
			/>
		</div>
	</div>
</template>

<style scoped>
.ip-cta {
	display: flex;
	align-items: center;
	gap: 0.875rem;
	padding: 0.875rem 1rem;
	border-radius: 0.75rem;
	background: var(--ui-bg);
	box-shadow: inset 0 0 0 1px var(--ui-border);
}

.ip-cta-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.75rem;
	height: 1.75rem;
	border-radius: 0.5rem;
	background: color-mix(in oklab, var(--color-primary) 10%, transparent);
	color: var(--color-primary);
	flex-shrink: 0;
}

.ip-cta-text {
	flex: 1;
	min-width: 0;
}

.ip-cta-title {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--ui-text-highlighted);
	margin: 0;
	line-height: 1.3;
}

.ip-cta-sub {
	margin-top: 0.125rem;
	font-size: 0.75rem;
	color: var(--ui-text-muted);
	margin-bottom: 0;
	line-height: 1.4;
}

.ip-cta-actions {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	flex-shrink: 0;
}

@media (max-width: 40rem) {
	.ip-cta {
		flex-wrap: wrap;
	}
	.ip-cta-text {
		flex-basis: calc(100% - 2.625rem);
	}
	.ip-cta-actions {
		flex-basis: 100%;
		justify-content: flex-end;
	}
}
</style>
