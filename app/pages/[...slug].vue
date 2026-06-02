<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

import { findPageBreadcrumb, findPageHeadline } from '@nuxt/content/utils';

const navigation = inject('navigation') as Ref<ContentNavigationItem[]>;

definePageMeta({
	layout: 'docs',
});

const route = useRoute();

const menuDrawerOpen = ref(false);
const tocDrawerOpen = ref(false);

watch(() => route.path, () => {
	menuDrawerOpen.value = false;
	tocDrawerOpen.value = false;
});

const { currentSection, currentGroup, groupSections, mobileSectionNavigation, allSectionItems } = useSectionNavigation();

const pageHeaderUi = {
	headline: 'font-mono font-normal! uppercase tracking-wider',
};

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

const { recordVisit, isFavorite, toggleFavorite } = usePageHistory();

watch(page, (current) => {
	if (import.meta.client && current?.title) {
		recordVisit({ path: path.value, title: current.title });
	}
}, { immediate: true });

const favorited = computed(() => isFavorite(path.value));

const headline = computed(() => findPageHeadline(navigation.value, path.value));

const ogBreadcrumb = computed(() =>
	(findPageBreadcrumb(navigation.value, path.value) ?? [])
		.map(item => item.title)
		.filter((title): title is string => Boolean(title)),
);

await useDocsOgImage({
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
	frameworkRootMatch.value ? frameworkNode.value?.icon : undefined,
);

const breadcrumb = computed(() => {
	const trail: { label: string; to?: string }[] = (findPageBreadcrumb(navigation.value, path.value) ?? [])
		.map(item => ({
			label: item.title,
			to: item.path === path.value || item.page === false ? undefined : item.path,
		}));

	if (trail.length === 0 && page.value?.title) {
		trail.push({ label: page.value.title });
	}

	if (frameworkGuideMatch.value && frameworkNode.value) {
		const frameworkPath = frameworkNode.value.path;
		const hasFrameworkCrumb = trail.some(item => item.to === frameworkPath);
		if (!hasFrameworkCrumb) {
			trail.push({ label: frameworkNode.value.title ?? '', to: frameworkPath });
		}
		else {
			for (const item of trail) {
				if (item.to === frameworkPath) item.label = frameworkNode.value.title ?? item.label;
			}
		}
	}

	return [
		{ 'icon': 'material-symbols:home-outline', 'to': '/', 'aria-label': 'Home' },
		...trail,
	];
});
</script>

<template>
	<DocsPage v-if="page">
		<div
			class="flex @min-[40rem]/docs-pane:hidden sticky top-(--ui-header-height) z-10 -mx-4 mb-4 items-center justify-between border-b border-dashed border-default bg-default/75 px-4 py-3 backdrop-blur"
		>
			<UDrawer
				v-model:open="menuDrawerOpen"
				direction="left"
				side="left"
				inset
				:handle="false"
				:ui="{ content: 'w-full max-w-2/3' }"
			>
				<UButton
					label="Menu"
					icon="material-symbols:menu"
					color="neutral"
					variant="link"
					size="xs"
					aria-label="Open navigation"
				/>
				<template #body>
					<MobileNavSectionSwitcher :items="allSectionItems" :current-section="currentSection" />
					<p class="text-xs font-medium text-dimmed uppercase font-mono tracking-widest mb-2 flex items-center gap-1">
						<Icon v-if="currentSection?.icon" :name="currentSection?.icon" class="size-3.5" />
						{{ currentSection?.label }}
					</p>
					<UContentNavigation
						:navigation="mobileSectionNavigation"
						variant="link"
						highlight
					/>
				</template>
			</UDrawer>

			<UDrawer
				v-if="page.body?.toc?.links?.length"
				v-model:open="tocDrawerOpen"
				direction="right"
				side="right"
				inset
				:handle="false"
				:ui="{ content: 'w-full max-w-2/3' }"
			>
				<UButton
					label="On this page"
					trailing-icon="material-symbols:chevron-right"
					color="neutral"
					variant="link"
					size="xs"
					aria-label="Open on this page"
				/>
				<template #body>
					<DocsToc
						:links="page.body?.toc?.links"
						:authors="page.authors"
						:file="page.id!"
						mobile
					/>
				</template>
			</UDrawer>
		</div>

		<UPageHeader
			:title="page.title ?? ''"
			:description="page.description ?? ''"
			:headline="headline"
			:ui="pageHeaderUi"
		>
			<template
				v-if="breadcrumb.length > 1"
				#headline
			>
				<UBreadcrumb :items="breadcrumb">
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
				<UButton
					:icon="favorited ? 'material-symbols:star' : 'material-symbols:star-outline'"
					:label="favorited ? 'Favorited' : 'Favorite'"
					color="neutral"
					variant="ghost"
					size="sm"
					@click="toggleFavorite({ path, title: page!.title ?? '' })"
				/>
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
	</DocsPage>
</template>
