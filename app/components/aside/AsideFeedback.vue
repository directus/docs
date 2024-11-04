<template>
	<div class="feedback">
		<Button
			color="outline-only"
			size="small"
			class="feedback-button"
		>
			<Icon name="material-symbols:thumb-up-rounded" />
		</Button>
		<Button
			color="outline-only"
			size="small"
			class="feedback-button"
		>
			<Icon name="material-symbols:thumb-down-rounded" />
		</Button>
		<div>
			<p class="cta">
				What do you think?
			</p>
			<p class="cta-sub">
				<i>Leave Feedback</i>
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.feedback {
	padding-top: 0.75rem;
	padding-bottom: 0.75rem;
	display: flex;
	justify-content: start;
	align-items: center;
	gap: 0.5rem;
}

.feedback-button {
	padding: 0.5rem !important;
}

p {
	color: var(--typography-subdued);
	font-size: 0.75rem;
}

.cta {
	font-weight: 600;
}
</style>
