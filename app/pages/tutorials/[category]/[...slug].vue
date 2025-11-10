<script setup lang="ts">
import type { ContentCollectionItem, ContentNavigationItem } from '@nuxt/content';
import { findPageBreadcrumb, mapContentNavigation } from '#ui/utils';

const navigation = inject('navigation') as Ref<ContentNavigationItem[]>;

definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();

const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path(route.path).first());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const imageSrc = (page: ContentCollectionItem | undefined) => {
	if (!page) return '';
	const technologies = page.technologies || ['directus'];
	const techString = technologies.join(', ');
	return `/docs/api/tutorialimg?logos=${techString}`;
};

const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(navigation.value, page.value)).map(({ icon, ...link }) => link));
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:ui="{ title: 'title', headline: 'headline' }"
			:description="page!.description"
		>
			<template #headline>
				<UBreadcrumb
					:items="breadcrumb"
				>
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
			<img
				v-if="page"
				:src="imageSrc(page)"
				alt="Generated Image"
			>
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
