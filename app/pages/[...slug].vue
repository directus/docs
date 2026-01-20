<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

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

// TODO: Remove Beta badge when Zapier integration is out of beta
const showComingSoonBadge = computed(() => {
	const path = route.path;
	const pageId = page.value?.id;

	// Show badge on Zapier pages
	if (path.includes('/integrations/zapier') || pageId === 'zapier-integration') {
		return true;
	}

	return false;
});

const { data: surroundRaw } = await useAsyncData(`${route.path}-surround`, () => queryCollectionItemSurroundings('content',
	route.path,
	{
		fields: ['title', 'description', 'path'],
	},
));

// Filter out .navigation.yml files from surround results -- not sure why Nuxt Content is including them
const surround = computed(() => surroundRaw.value?.filter(item => !item?.path?.endsWith('.navigation')) ?? []);
</script>

<template>
	<UPage>
		<UPageHeader
			:title="!showComingSoonBadge ? (page!.title ?? '') : undefined"
			:description="page!.description ?? ''"
			:headline="headline"
			:ui="{ headline: 'headline', title: 'title' }"
		>
			<!-- TODO: Remove Beta badge when Zapier integration is out of beta -->
			<template
				v-if="showComingSoonBadge"
				#title
			>
				<div class="flex items-center gap-2">
					<span>{{ page!.title ?? '' }}</span>
					<UBadge
						variant="soft"
						color="info"
						size="sm"
					>
						Beta
					</UBadge>
				</div>
			</template>
			<template #links>
				<CopyDocButton :page="page!" />
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
