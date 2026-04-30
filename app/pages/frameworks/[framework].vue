<script setup lang="ts">
import {
	coreGuideLinks,
	frameworkGuideGroup,
	frameworkGuideGroupOrder,
	getFramework,
	type FrameworkGuide,
} from '~/utils/frameworks';

definePageMeta({
	layout: 'docs',
});

const route = useRoute();
const slug = computed(() => String(route.params.framework));
const framework = computed(() => getFramework(slug.value));

if (!framework.value) {
	throw createError({ statusCode: 404, statusMessage: 'Framework not found', fatal: true });
}

const { data: guides } = await useAsyncData(`framework-${slug.value}-guides`, () =>
	queryCollection('content')
		.where('path', 'LIKE', `/frameworks/${slug.value}/%`)
		.select('title', 'description', 'icon', 'path', 'technologies', 'navigation', 'stem')
		.all(),
);

const guideOrder = [
	'data-fetching',
	'authentication',
	'build-a-cms',
	'dynamic-pages',
	'forms',
	'dynamic-forms',
	'live-preview',
	'live-preview-setup',
	'live-preview-draft-mode',
	'visual-editor',
	'reusable-blocks',
	'multilingual-content',
	'internationalization',
	'pagination-infinite-scroll',
];

const guideSlug = (path: string | undefined) => path?.split('/').filter(Boolean).pop() ?? '';
const guideTitle = (guide: FrameworkGuide) => typeof guide.navigation === 'object' && guide.navigation.title
	? guide.navigation.title
	: guide.title;

const guideSortOrder = (path: string | undefined) => {
	const index = guideOrder.indexOf(guideSlug(path));
	return index === -1 ? 99 : index;
};

const frameworkGuides = computed(() => (guides.value ?? [])
	.filter(guide => guide.navigation !== false)
	.sort((a, b) => {
		const groupDiff = frameworkGuideGroupOrder(a.path) - frameworkGuideGroupOrder(b.path);
		if (groupDiff !== 0) return groupDiff;

		const orderDiff = guideSortOrder(a.path) - guideSortOrder(b.path);
		if (orderDiff !== 0) return orderDiff;

		return (a.title ?? '').localeCompare(b.title ?? '');
	}) as FrameworkGuide[]);

const groupedGuides = computed(() => {
	const groups = new Map<string, FrameworkGuide[]>();

	for (const guide of frameworkGuides.value) {
		const group = frameworkGuideGroup(guide.path);
		groups.set(group, [...(groups.get(group) ?? []), guide]);
	}

	return [...groups.entries()].map(([title, items]) => ({ title, items }));
});

const coreGuides = computed(() => coreGuideLinks.map(link => ({
	title: link.label,
	description: link.description,
	path: link.path,
	icon: link.icon,
})));

const tocLinks = computed(() => [
	...groupedGuides.value.map(group => ({
		id: slugify(group.title),
		text: group.title,
		depth: 2,
	})),
	{
		id: 'core-directus-guides',
		text: 'Core Directus guides',
		depth: 2,
	},
]);

useSeoMeta({
	title: `${framework.value.label} Guides`,
	description: framework.value.description,
});
</script>

<template>
	<UPage v-if="framework">
		<UPageHeader
			:description="framework.description"
			:ui="{ title: 'title' }"
		>
			<template #headline>
				<UButton
					to="/frameworks"
					variant="link"
					color="neutral"
					icon="i-ph-arrow-left"
					class="px-0"
				>
					Frameworks
				</UButton>
			</template>

			<template #title>
				<span class="flex items-center gap-4">
					<span class="flex size-14 items-center justify-center rounded-xl bg-muted text-muted ring ring-default">
						<Icon
							:name="framework.icon"
							class="size-8"
						/>
					</span>
					<span>{{ framework.label }} Guides</span>
				</span>
			</template>
		</UPageHeader>

		<UPageBody>
			<section
				v-for="group in groupedGuides"
				:key="group.title"
				class="mb-10"
			>
				<ProseH2 :id="slugify(group.title)">
					{{ group.title }}
				</ProseH2>

				<ul class="not-prose divide-y divide-default rounded-lg border border-default">
					<li
						v-for="guide in group.items"
						:key="guide.path"
						class="p-4 transition hover:bg-muted/50"
					>
						<NuxtLink
							:to="guide.path"
							class="group flex items-start justify-between gap-4"
						>
							<span>
								<span class="font-semibold text-highlighted group-hover:text-primary">
									{{ guideTitle(guide) }}
								</span>
								<span class="mt-1 block text-sm text-muted">
									{{ guide.description }}
								</span>
							</span>
							<Icon
								name="i-ph-arrow-right"
								class="mt-1 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
							/>
						</NuxtLink>
					</li>
				</ul>
			</section>

			<ProseCallout
				v-if="!frameworkGuides.length"
				icon="i-ph-info"
			>
				No framework-specific guides yet. Use the core Directus guides below to get started.
			</ProseCallout>

			<section class="mt-12">
				<ProseH2 id="core-directus-guides">
					Core Directus guides
				</ProseH2>
				<ProseP>
					Use these guides to understand the Directus concepts behind your {{ framework.label }} implementation.
				</ProseP>

				<ul class="not-prose divide-y divide-default rounded-lg border border-default">
					<li
						v-for="guide in coreGuides"
						:key="guide.path"
						class="p-4 transition hover:bg-muted/50"
					>
						<NuxtLink
							:to="guide.path"
							class="group flex items-start gap-3"
						>
							<Icon
								:name="guide.icon"
								class="mt-0.5 size-5 shrink-0 text-muted"
							/>
							<span class="min-w-0 flex-1">
								<span class="font-semibold text-highlighted group-hover:text-primary">
									{{ guide.title }}
								</span>
								<span class="mt-1 block text-sm text-muted">
									{{ guide.description }}
								</span>
							</span>
							<Icon
								name="i-ph-arrow-right"
								class="mt-1 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
							/>
						</NuxtLink>
					</li>
				</ul>
			</section>
		</UPageBody>

		<template #right>
			<UContentToc :links="tocLinks" />
		</template>
	</UPage>
</template>
