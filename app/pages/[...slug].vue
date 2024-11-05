<script setup lang="ts">
const { data: allNavigation } = await useAsyncData(`all_navigation`, () =>
	fetchContentNavigation(),
);

const route = useRoute();

if (!allNavigation.value) {
	throw createError({
		statusCode: 404,
		fatal: true,
	});
}

if (route.path === '/' && allNavigation.value?.length) {
	prerenderRoutes(allRoutes(allNavigation.value));
}

const { data: allPages } = await useAsyncData(`all_page`, () =>
	queryContent()
		.where({ _partial: false })
		.only(['_path', 'additional_paths'])
		.find(),
);

if (!allPages.value) {
	throw createError({
		statusCode: 404,
		fatal: true,
	});
}

const resolvedRoute = resolveRoute(route.path, allPages.value, allNavigation.value);

if (!resolvedRoute) {
	throw createError({
		statusCode: 404,
		fatal: true,
	});
}

const { data: page } = await useAsyncData(`page_data:${resolvedRoute}`, () =>
	queryContent()
		.where({ $or: [{ _path: { $eq: resolvedRoute } }] })
		.findOne(),
);

if (!page.value) {
	throw createError({
		statusCode: 404,
		fatal: true,
	});
}

definePageMeta({});

useSeoMeta({
	title: page.value.title,
	description: page.value.description,
});

defineOgImage({
	component: 'OgImageDefault',
	props: {
		title: page.value.title,
		breadcrumbs: resolvedRoute.split('/').slice(1, -1),
	},
});
</script>

<template>
	<div>
		<component
			:is="`Pages${page?.style || 'DocumentationPage'}`"
			v-if="page"
			:data="page"
			:all-pages="allPages"
			:all-navigation="allNavigation"
		/>
	</div>
</template>
