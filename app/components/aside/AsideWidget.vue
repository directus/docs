<script lang="ts" setup>
import { readItems } from '@directus/sdk';

const { data } = await useAsyncData('documentation_widget', async () => {
	return db().request(readItems('documentation_widget'));
});
</script>

<template>
	<div
		v-if="data && data.length > 0"
		class="widget"
	>
		<h2>{{ data[0]?.title }}</h2>
		<p>{{ data[0]?.message }}</p>
		<NuxtLink
			v-if="data[0]?.link_text && data[0]?.link"
			:to="data[0]?.link"
			:external="data[0]?.link.startsWith('http')"
			:target="data[0]?.link.startsWith('http') ? '_blank' : undefined"
		>
			<Button
				color="white"
				size="small"
				style="width: 100%;"
				class="button-dark-mode-override"
				:label="data[0]?.link_text"
			/>
		</NuxtLink>
	</div>
</template>

<style scoped lang="scss">
.widget {
	background-image: url("~/assets/img/purple-cta-bg.svg");
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
