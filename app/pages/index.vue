<script setup lang="ts">
const route = useRoute();
const { data: page } = await useAsyncData(route.path, () =>
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
	<UContainer>
		<UPage class="pb-48">
			<UPageHeader
				:title="page!.title"
				:description="page!.description"
			/>

			<UPageBody>
				<ContentRenderer
					v-if="page!"
					:value="page"
				/>
			</UPageBody>
		</UPage>
	</UContainer>
</template>
