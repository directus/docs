<script lang="ts" setup>
import { z } from 'zod';

const runtimeConfig = useRuntimeConfig();

const emailSchema = z.object({
	email: z.string().email(),
});

const status = ref<'idle' | 'pending' | 'error' | 'success'>('idle');
const errorMessage = ref<string | null>(null);
const state = reactive({
	email: '',
});
const canSubmit = computed(() => status.value !== 'pending' && emailSchema.safeParse(state).success);

async function subscribe() {
	status.value = 'pending';
	errorMessage.value = null;

	try {
		await $fetch(runtimeConfig.public.NEWSLETTER_URL, {
			method: 'POST',
			body: state,
		});
		status.value = 'success';
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	catch (error: any) {
		status.value = 'error';
		errorMessage.value = error.message || 'An error occurred';
	}
}
</script>

<template>
	<div class="newsletter">
		<h2>Newsletter</h2>
		<p>Get insights, releases, and product updates delivered directly to your inbox once a month.</p>
		<input
			v-model="state.email"
			type="email"
			placeholder="Email Address"
			:disabled="status == 'pending'"
		>
		<Button
			color="white"
			size="small"
			style="width: 100%;"
			class="button-dark-mode-override"
			:disabled="!canSubmit"
			:loading="status == 'pending'"
			:label="status == 'success' ? 'You\'re Subscribed!' : 'Subscribe'"
			@click="subscribe"
		/>
		<p
			v-if="status == 'error'"
			class="error"
		>
			{{ errorMessage }}
		</p>
	</div>
</template>

<style scoped lang="scss">
.newsletter {
	background-image: url("~/assets/img/pink-cta-bg.svg");
	background-position: center top;
	border: 1px solid var(--border);
	border-radius: calc(var(--border-radius) * 2);
	padding: 0.75rem;
	color: white;

	h2 {
		font-weight: 600;
		font-size: 1rem;
		margin: 4px 0 0;
		line-height: 1;
	}
	p {
		margin: 0.5rem 0;
		font-size: 0.8rem;
	}

	input {
		padding: 6px 8px;
		width: 100%;
		color: white;
		border-radius: 6px;
		border: 1px solid rgba(213, 220, 229, 0.50);
		background: rgba(213, 220, 229, 0.20);
		margin-bottom: 4px;
		font-size: 0.9rem;
		font-weight: 500;
	}

	input:focus-visible {
		outline: none;
		border-color: var(--white);
	}

	input::placeholder {
		color: white;
		opacity: 0.75;
	}
}

.button-dark-mode-override {
	color: var(--black);
	background-color: color-mix(in hsl shorter hue, var(--white) 95%, var(--black) 5%) !important;
	border-color: color-mix(in hsl shorter hue, var(--white) 95%, var(--black) 5%) !important;
}
</style>
