<script setup lang="ts">
definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

defineOgImage({
	component: 'OgImageDefault',
	props: {
		title: page.value.title,
		breadcrumb: pageBreadcrumb(page.value._path!),
	},
});
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:description="page!.description"
		>
			<template #headline>
				<NuxtLink
					to="/tutorials"
					class="flex items-center"
				>
					<UIcon
						name="material-symbols:arrow-back-rounded"
						class="mr-1"
					/> Tutorials
				</NuxtLink>
			</template>
		</UPageHeader>

		<UPageBody prose>
			<ContentRenderer
				v-if="page!.body"
				:value="page"
			/>

			<TutorialsArticles :path="route.path" />
		</UPageBody>
	</UPage>
</template>
