<script setup lang="ts">
const { $posthog } = useNuxtApp();

const savedValue = ref<'good' | 'bad' | null>(null);
const buttonLoading = ref<boolean>(false);
const buttonTimeout = 500;

const handleFeedback = (feedback: 'good' | 'bad') => {
	if (buttonLoading.value) return;
	savedValue.value = feedback;
	buttonLoading.value = true;

	$posthog?.capture(`feedback_${feedback}`);

	setTimeout(() => {
		buttonLoading.value = false;
	}, buttonTimeout);
};
</script>

<template>
	<div>
		<p class="font-semibold text-sm mb-2 truncate">
			Was this helpful?
		</p>
		<div class="space-y-3">
			<UButton
				:icon="savedValue === 'good' ? 'material-symbols:check' : 'material-symbols:thumb-up-outline'"
				square
				variant="subtle"
				color="neutral"
				:loading="buttonLoading && savedValue === 'good'"
				:disabled="savedValue !== null"
				class="mr-2"
				:class="{ 'disabled:text-primary disabled:bg-primary-100 disabled:ring-primary': !buttonLoading && savedValue === 'good' }"
				@click="handleFeedback('good')"
			/>
			<UButton
				:icon="savedValue === 'bad' ? 'material-symbols:check' : 'material-symbols:thumb-down-outline'"
				square
				variant="subtle"
				color="neutral"
				:loading="buttonLoading && savedValue === 'bad'"
				:disabled="savedValue !== null"
				:class="{ 'disabled:text-primary disabled:bg-primary-100 disabled:ring-primary': !buttonLoading && savedValue === 'bad' }"
				@click="handleFeedback('bad')"
			/>
		</div>
	</div>
</template>
