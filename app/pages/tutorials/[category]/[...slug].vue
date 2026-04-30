<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import { findPageBreadcrumb } from '@nuxt/content/utils';

const navigation = inject('navigation') as Ref<ContentNavigationItem[]>;

definePageMeta({
	layout: 'tutorial',
});

const { path } = useNormalizedPath();

const { data: page } = await useAsyncData(path, () =>
	queryCollection('content').path(path.value).first(),
);

if (!page.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Page not found',
		fatal: true,
	});
}

const breadcrumb = computed(() =>
	(findPageBreadcrumb(navigation.value, path.value) ?? []).map(item => ({
		label: item.title,
		to: item.path,
	})),
);

defineOgImage('Default', {
	title: page.value?.title ?? 'Directus Docs',
	description: page.value?.description ?? '',
	breadcrumb: breadcrumb.value
		.map(item => item.label)
		.filter((label): label is string => Boolean(label)),
});
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:ui="{ title: 'title', headline: 'headline' }"
			:description="page!.description"
		>
			<template #headline>
				<UBreadcrumb :items="breadcrumb">
					<template #separator>
						<span class="mx-2 text-muted">/</span>
					</template>
				</UBreadcrumb>
			</template>

			<template
				v-if="page"
				#links
			>
				<CopyDocButton :page="page" />
			</template>
		</UPageHeader>

		<UPageBody
			class="content"
			prose
		>
			<ContentRenderer
				v-if="page"
				:value="page"
			/>
		</UPageBody>

		<template
			v-if="page!.body?.toc?.links?.length"
			#right
		>
			<DocsToc
				:links="page!.body?.toc?.links"
				:authors="page!.authors"
				:file="page!.id!"
			/>
		</template>
	</UPage>
</template>
