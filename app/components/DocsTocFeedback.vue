<script setup lang="ts">
const { $posthog } = useNuxtApp();

const savedValue = ref<'good' | 'bad' | null>(null);
const buttonLoading = ref(false);

const options = [
	{ value: 'good', icon: 'material-symbols:thumb-up-outline' },
	{ value: 'bad', icon: 'material-symbols:thumb-down-outline' },
] as const;

const handleFeedback = (feedback: 'good' | 'bad') => {
	if (buttonLoading.value) return;
	savedValue.value = feedback;
	buttonLoading.value = true;

	$posthog?.capture(`feedback_${feedback}`);

	setTimeout(() => {
		buttonLoading.value = false;
	}, 500);
};
</script>

<template>
	<div>
		<p class="font-semibold text-sm mb-2 truncate">
			Was this helpful?
		</p>
		<div class="space-y-3">
			<UButton
				v-for="option in options"
				:key="option.value"
				:icon="savedValue === option.value ? 'material-symbols:check' : option.icon"
				square
				size="xl"
				variant="ghost"
				color="neutral"
				:ui="
					{
						base: 'rounded-md',
					}"
				:loading="buttonLoading && savedValue === option.value"
				:disabled="savedValue !== null"
				:class="[
					option.value === 'good' && 'mr-1',
					!buttonLoading && savedValue === option.value && 'disabled:text-primary disabled:bg-primary-100 disabled:ring-primary',
				]"
				@click="handleFeedback(option.value)"
			/>
		</div>
	</div>
</template>
