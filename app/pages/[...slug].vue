<script setup lang="ts">
const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const headline = computed(() => findPageHeadline(page.value!));
</script>

<template>
	<UPage>
		<UPageHeader :title="page!.title" :description="page!.description" :links="page!.links" :headline="headline" />

		<UPageBody prose>
			<ContentRenderer v-if="page!.body" :value="page" />
		</UPageBody>
	</UPage>
</template>

<style scoped>
/* Your component styles go here */
</style>
