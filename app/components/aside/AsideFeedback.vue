<script setup lang="ts">
const { $clientPosthog } = useNuxtApp();

const buttonLoading = ref<'good' | 'bad' | null>(null);
const buttonTimeout = 500;

const handleFeedback = (feedback: 'good' | 'bad') => {
	if (buttonLoading.value) return;
	buttonLoading.value = feedback;
	$clientPosthog?.capture(`feedback_${feedback}`);
	setTimeout(() => {
		buttonLoading.value = null;
	}, buttonTimeout);
};
</script>

<template>
	<div class="feedback">
		<Button
			color="outline-only"
			size="small"
			class="feedback-button"
			:disabled="buttonLoading !== null"
			@click="() => handleFeedback('good')"
		>
			<Icon
				v-if="buttonLoading === 'good'"
				name="svg-spinners:180-ring-with-bg"
			/>
			<Icon
				v-else
				name="material-symbols:thumb-up-rounded"
			/>
		</Button>
		<Button
			color="outline-only"
			size="small"
			class="feedback-button"
			:disabled="buttonLoading !== null"
			@click="() => handleFeedback('bad')"
		>
			<Icon
				v-if="buttonLoading === 'bad'"
				name="svg-spinners:180-ring-with-bg"
			/>
			<Icon
				v-else
				name="material-symbols:thumb-down-rounded"
			/>
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
