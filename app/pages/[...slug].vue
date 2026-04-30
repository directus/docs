<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

import { findPageBreadcrumb, findPageHeadline } from '@nuxt/content/utils';

const navigation = inject('navigation') as Ref<ContentNavigationItem[]>;

definePageMeta({
	layout: 'docs',
});

const route = useRoute();

const { path } = useNormalizedPath();

if (path.value.endsWith('/.navigation')) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Page not found',
		fatal: true,
	});
}

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

const headline = computed(() => findPageHeadline(navigation.value, path.value));

const ogBreadcrumb = computed(() =>
	(findPageBreadcrumb(navigation.value, path.value) ?? [])
		.map(item => item.title)
		.filter((title): title is string => Boolean(title)),
);

defineOgImage('Default', {
	title: page.value?.title ?? 'Directus Docs',
	description: page.value?.description ?? '',
	breadcrumb: ogBreadcrumb.value,
});

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
	queryCollectionItemSurroundings('content', route.path, {
		fields: ['title', 'description', 'path'],
	}).where('path', 'NOT LIKE', '%.navigation'),
);

const frameworkRootMatch = computed(() => /^\/frameworks\/([^/]+)\/?$/.exec(path.value));
const frameworkGuideMatch = computed(() => /^\/frameworks\/([^/]+)\/.+/.exec(path.value));
const frameworkSlug = computed(() => frameworkRootMatch.value?.[1] ?? frameworkGuideMatch.value?.[1]);

const frameworkNode = computed(() => {
	const slug = frameworkSlug.value;
	return slug ? findNavNode(navigation.value, `/frameworks/${slug}`) : undefined;
});

const frameworkIcon = computed(() =>
	frameworkRootMatch.value
		? (frameworkNode.value as { icon?: string } | undefined)?.icon
		: undefined,
);

const frameworkBreadcrumb = computed(() => {
	if (frameworkGuideMatch.value && frameworkNode.value) {
		return [
			{ label: 'Frameworks', to: '/frameworks' },
			{ label: frameworkNode.value.title, to: frameworkNode.value.path },
		];
	}
	if (frameworkRootMatch.value) {
		return [{ label: 'Frameworks', to: '/frameworks' }];
	}
	return [];
});
</script>

<template>
	<UPage v-if="page">
		<UPageHeader
			:title="page.title ?? ''"
			:description="page.description ?? ''"
			:headline="headline"
			:ui="{ headline: 'headline', title: 'title' }"
		>
			<template
				v-if="frameworkBreadcrumb.length"
				#headline
			>
				<UBreadcrumb :items="frameworkBreadcrumb">
					<template #separator>
						<span class="mx-2 text-muted">/</span>
					</template>
				</UBreadcrumb>
			</template>

			<template
				v-if="frameworkIcon"
				#title
			>
				<span class="flex items-center gap-4">
					<span class="flex size-14 items-center justify-center rounded-xl bg-muted text-muted ring ring-default">
						<Icon
							:name="frameworkIcon"
							class="size-8"
						/>
					</span>
					<span>{{ page.title }}</span>
				</span>
			</template>

			<template
				v-if="!frameworkRootMatch"
				#links
			>
				<CopyDocButton :page="page" />
			</template>
		</UPageHeader>

		<UPageBody
			class="content"
			prose
		>
			<ContentRenderer :value="page" />

			<USeparator v-if="surround?.length" />

			<NewsletterForm />

			<UContentSurround :surround="surround" />
		</UPageBody>

		<template
			v-if="page.body?.toc?.links?.length"
			#right
		>
			<DocsToc
				:links="page.body?.toc?.links"
				:authors="page.authors"
				:file="page.id!"
			/>
		</template>
	</UPage>
</template>
