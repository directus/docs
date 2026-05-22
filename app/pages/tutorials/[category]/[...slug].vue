<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import { findPageBreadcrumb } from '@nuxt/content/utils';

const navigation = inject('navigation') as Ref<ContentNavigationItem[]>;

definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();
const menuDrawerOpen = ref(false);
const tocDrawerOpen = ref(false);
watch(() => route.path, () => { menuDrawerOpen.value = false; tocDrawerOpen.value = false; });

const { mobileSectionNavigation, currentSection, allSectionItems } = useSectionNavigation();

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

const { recordVisit, isFavorite, toggleFavorite } = usePageHistory();

const pageHeaderUi = {
	headline: 'font-mono font-normal! uppercase tracking-wider',
};

watch(page, (current) => {
	if (import.meta.client && current?.title) {
		recordVisit({ path: path.value, title: current.title });
	}
}, { immediate: true });

const favorited = computed(() => isFavorite(path.value));

const breadcrumb = computed(() => {
	const trail = (findPageBreadcrumb(navigation.value, path.value) ?? [])
		.map(item => ({
			label: item.title,
			to: item.path === path.value || item.page === false ? undefined : item.path,
		}));

	return [
		{ 'icon': 'i-ph-house', 'to': '/', 'aria-label': 'Home' },
		...trail,
	];
});

const frameworkChips = computed(() => {
	const tech = page.value?.technologies ?? [];
	const root = findNavNode(navigation.value, '/frameworks');
	const frameworks = root?.children ?? [];
	return tech
		.map((slug) => {
			const node = frameworks.find(f => f.path === `/frameworks/${slug}`);
			if (!node) return null;
			return {
				label: node.title,
				icon: node.icon,
				to: node.path,
			};
		})
		.filter(c => c !== null);
});

defineOgImage('Default', {
	title: page.value?.title ?? 'Directus Docs',
	description: page.value?.description ?? '',
	breadcrumb: breadcrumb.value
		.map(item => item.label)
		.filter((label): label is string => Boolean(label)),
});
</script>

<template>
	<DocsPage>
		<div class="flex @min-[40rem]/docs-pane:hidden sticky top-(--ui-header-height) z-10 -mx-4 mb-4 items-center justify-between border-b border-dashed border-default bg-default/75 px-4 py-3 backdrop-blur">
			<UDrawer
				v-model:open="menuDrawerOpen"
				direction="left"
				side="left"
				inset
				:handle="false"
				:ui="{ content: 'w-full max-w-2/3' }"
			>
				<UButton label="Menu" icon="heroicons-outline:menu-alt-2" color="neutral" variant="link" size="xs" aria-label="Open navigation" />
				<template #body>
					<MobileNavSectionSwitcher :items="allSectionItems" :current-section="currentSection" />
					<p class="text-xs font-medium text-dimmed uppercase font-mono tracking-widest mb-2 flex items-center gap-1">
						<Icon v-if="currentSection?.icon" :name="currentSection?.icon" class="size-3.5" />
						{{ currentSection?.label }}
					</p>
					<UContentNavigation :navigation="mobileSectionNavigation" variant="link" highlight />
				</template>
			</UDrawer>
			<UDrawer
				v-if="page!.body?.toc?.links?.length"
				v-model:open="tocDrawerOpen"
				direction="right"
				side="right"
				inset
				:handle="false"
				:ui="{ content: 'w-full max-w-2/3' }"
			>
				<UButton label="On this page" trailing-icon="heroicons-outline:chevron-right" color="neutral" variant="link" size="xs" aria-label="Open on this page" />
				<template #body>
					<DocsToc :links="page!.body?.toc?.links" :authors="page!.authors" :file="page!.id!" mobile />
				</template>
			</UDrawer>
		</div>

		<UPageHeader
			:title="page!.title"
			:ui="pageHeaderUi"
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
				v-if="frameworkChips.length"
				#description
			>
				<p
					v-if="page!.description"
					class="mb-4"
				>
					{{ page!.description }}
				</p>
				<div class="flex flex-wrap gap-2">
					<NuxtLink
						v-for="chip in frameworkChips"
						:key="chip.to"
						:to="chip.to"
					>
						<UBadge
							:icon="chip.icon"
							color="neutral"
							variant="subtle"
							size="md"
							class="hover:bg-primary/10 hover:text-primary transition cursor-pointer"
						>
							{{ chip.label }}
						</UBadge>
					</NuxtLink>
				</div>
			</template>

			<template
				v-if="page"
				#links
			>
				<UButton
					:icon="favorited ? 'i-ph-star-fill' : 'i-ph-star'"
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
	</DocsPage>
</template>
