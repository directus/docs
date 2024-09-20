<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo';

const route = useRoute();

const { data } = await useAsyncData(`${route.path}-surround`, () =>
	queryContent()
		.where({
			_extension: 'md',
			navigation: { $ne: false },
			_path: { $regex: '^(?!/_).*' },
		})
		.only(['title', 'description', '_path'])
		.findSurround(withoutTrailingSlash(route.path)),
);

const prev = computed(() => data.value?.[0]);
const next = computed(() => data.value?.[1]);
</script>

<template>
	<div class="prev-next">
		<NuxtLink
			v-if="prev"
			:to="prev._path"
		>
			<span class="section-title">Previous Page</span>
			<p>{{ prev.title }}</p>
		</NuxtLink>
		<div v-else />
		<NuxtLink
			v-if="next"
			:to="next._path"
		>
			<span class="section-title">Next Page</span>
			<p>{{ next.title }}</p>
		</NuxtLink>
		<div v-else />
	</div>
</template>

<style scoped>
div {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
	a {
		text-decoration: none;
		border: 1px solid var(--border-subdued);
		border-radius: var(--border-radius);
		padding: 0.5rem 1rem 0.65rem;
		&:last-child {
			text-align: right;
		}
		&:hover {
			border: 1px solid var(--border-subtle);
		}
		p {
			font-weight: bold;
		}
	}
}
</style>
