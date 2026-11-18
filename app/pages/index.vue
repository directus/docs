<script setup lang="ts">
definePageMeta({
	layout: 'docs',
});

const { data: page } = await useAsyncData('landing', () =>
	queryCollection('landing').path('/').first(),
);

if (!page.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Page not found',
		fatal: true,
	});
}
</script>

<template>
	<div class="pb-24">
		<HomePersonalized />

		<HomeHero />

		<UPageBody>
			<ContentRenderer
				v-if="page!"
				:value="page"
			/>
		</UPageBody>
	</div>
</template>
