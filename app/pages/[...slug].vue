<script setup lang="ts">
const allPages = await queryContent()
	.where({ _partial: false })
	.only(['_path', 'additional_paths'])
	.find();

const allNavigation = await fetchContentNavigation();

const route = useRoute();

if (route.path === '/') {
	prerenderRoutes(allRoutes(allNavigation));
}

const resolvedRoute = resolveRoute(route.path, allPages, allNavigation);

if (!resolvedRoute) {
	throw createError({
		statusCode: 404,
		fatal: true,
	});
}

const page = await queryContent()
	.where({ $or: [{ _path: { $eq: resolvedRoute } }] })
	.findOne();

definePageMeta({});

useSeoMeta({
	title: page.title,
	description: page.description,
});

// defineOgImage({
// 	component: 'Docs',
// 	title: data.value.title,
// 	description: data.value.description,
// });
</script>

<template>
	<div>
		<component
			:is="`Pages${page?.style || 'DocumentationPage'}`"
			v-if="page"
			:data="page"
		/>
	</div>
</template>
