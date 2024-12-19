<script setup lang="ts">
const { $clientPosthog } = useNuxtApp();

const savedValue = ref<'good' | 'bad' | null>(null);
const buttonLoading = ref<boolean>(false);
const buttonTimeout = 500;

const handleFeedback = (feedback: 'good' | 'bad') => {
	if (buttonLoading.value) return;
	savedValue.value = feedback;
	buttonLoading.value = true;

	$clientPosthog?.capture(`feedback_${feedback}`);

	setTimeout(() => {
		buttonLoading.value = false;
	}, buttonTimeout);
};
</script>

<template>
	<div>
		<p class="font-semibold text-sm/6 truncate">
			Was this helpful?
		</p>
		<div class="space-y-3">
			<UButton
				:icon="savedValue === 'good' ? 'material-symbols:check' : 'material-symbols:thumb-up-outline'"
				square
				color="gray"
				:loading="buttonLoading && savedValue === 'good'"
				:disabled="savedValue !== null"
				class="mr-2"
				@click="handleFeedback('good')"
			/>
			<UButton
				:icon="savedValue === 'bad' ? 'material-symbols:check' : 'material-symbols:thumb-down-outline'"
				square
				color="gray"
				:loading="buttonLoading && savedValue === 'bad'"
				:disabled="savedValue !== null"
				@click="handleFeedback('bad')"
			/>
		</div>
	</div>
</template>
