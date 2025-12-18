<script setup lang="ts">
import type { ContentCollectionItem, ContentNavigationItem } from '@nuxt/content';

import { findPageHeadline } from '#ui-pro/utils';

const navigation = inject('navigation') as Ref<ContentNavigationItem[]>;

definePageMeta({
	layout: 'docs',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path(route.path).first());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const headline = computed(() => findPageHeadline(navigation.value, page.value));

const imageSrc = (page: ContentCollectionItem | undefined) => {
	if (!page) return '';
	// Only show image on pages with title "Integration"
	if (page.title !== 'Integration') return '';
	const technologies = page.technologies || ['directus'];
	const techString = technologies.join(', ');
	return `/docs/api/tutorialimg?logos=${techString}`;
};

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryCollectionItemSurroundings('content',
	route.path,
	{
		fields: ['title', 'description', 'navigation', 'path'],
	},
));
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title ?? ''"
			:description="page!.description ?? ''"
			:headline="headline"
			:ui="{ headline: 'headline', title: 'title' }"
		>
			<template #links>
				<CopyDocButton :page="page!" />
			</template>
			<img
				v-if="imageSrc(page)"
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

			<USeparator v-if="surround?.length" />

			<NewsletterForm />

			<UContentSurround :surround="surround" />
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
