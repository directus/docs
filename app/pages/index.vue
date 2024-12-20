<script setup lang="ts">
const route = useRoute();
const { data: page } = await useAsyncData(route.path, () =>
	queryContent(route.path).findOne(),
);

if (!page.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Page not found',
		fatal: true,
	});
}

defineOgImage({
	component: 'OgImageDefault',
	props: {
		title: page.value.title,
	},
});
</script>

<template>
	<UContainer>
		<UPage class="pb-48">
			<UPageHeader
				:title="page!.title"
				:description="page!.description"
				:links="page!.links"
				:ui="{}"
			/>

			<UPageBody prose>
				<ContentRenderer
					v-if="page!.body"
					:value="page"
				/>
			</UPageBody>
		</UPage>
	</UContainer>
</template>
