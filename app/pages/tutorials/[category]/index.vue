<script setup lang="ts">
definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path('/tutorials/' + route.params.category).first());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:description="page!.description"
			:ui="{ title: 'title' }"
		>
			<template #headline>
				<NuxtLink
					to="/tutorials"
					class="flex items-center headline"
				>
					<UIcon
						name="material-symbols:arrow-back-rounded"
						class="mr-1"
					/> Tutorials
				</NuxtLink>
			</template>
		</UPageHeader>

		<UPageBody>
			<TutorialsArticles :path="route.path" />
		</UPageBody>
	</UPage>
</template>
