<script setup lang="ts">
defineEmits<{ start: []; dismiss: [] }>();
</script>

<template>
	<div class="flex items-center gap-3.5 rounded-xl border border-default bg-default px-4 py-3.5 @max-[40rem]/docs-pane:flex-wrap">
		<div class="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
			<UIcon
				name="i-lucide-sparkles"
				class="size-4"
			/>
		</div>
		<div class="min-w-0 flex-1 @max-[40rem]/docs-pane:basis-[calc(100%-2.625rem)]">
			<p class="text-sm font-medium leading-snug text-highlighted">
				Personalize your docs experience
			</p>
			<p class="mt-0.5 text-xs leading-snug text-muted">
				Tell us your stack and we'll tailor examples, snippets, and search results. No personal info collected.
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-1 @max-[40rem]/docs-pane:w-full @max-[40rem]/docs-pane:justify-end">
			<UButton
				label="Start"
				trailing-icon="i-lucide-arrow-right"
				color="primary"
				variant="soft"
				size="sm"
				@click="$emit('start')"
			/>
			<UButton
				icon="i-lucide-x"
				color="neutral"
				variant="ghost"
				size="sm"
				aria-label="Dismiss"
				@click="$emit('dismiss')"
			/>
		</div>
	</div>
</template>
