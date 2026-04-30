<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

const props = defineProps<{
	slug: string;
}>();

const navigation = inject('navigation') as Ref<ContentNavigationItem[]> | undefined;

const frameworkLabel = computed(() => {
	const node = findNavNode(navigation?.value, `/frameworks/${props.slug}`);
	return node?.title ?? props.slug;
});

const { data: guides } = await useAsyncData(`framework-${props.slug}-guides`, () =>
	queryCollection('content')
		.where('path', 'LIKE', `/frameworks/${props.slug}/%`)
		.where('path', 'NOT LIKE', '%/.navigation')
		.where('stem', 'NOT LIKE', '%/index')
		.select('title', 'description', 'path', 'navigation', 'section', 'stem')
		.order('stem', 'ASC')
		.all(),
);

const { data: tutorials } = await useAsyncData(`framework-${props.slug}-tutorials`, () =>
	queryCollection('content')
		.where('path', 'LIKE', '/tutorials/%')
		.select('title', 'description', 'path', 'technologies')
		.all(),
);

type LinkItem = {
	title: string;
	description?: string;
	path: string;
};

const guideTitle = (g: { title: string; navigation?: unknown }) => {
	if (g.navigation && typeof g.navigation === 'object' && 'title' in g.navigation) {
		const navTitle = (g.navigation as { title?: string }).title;
		if (navTitle) return navTitle;
	}
	return g.title;
};

const visibleGuides = computed(() => (guides.value ?? [])
	.filter(g => g.navigation !== false));

const startHere = computed<LinkItem[]>(() =>
	visibleGuides.value
		.filter(g => g.section === 'start-here')
		.map(g => ({ title: guideTitle(g), description: g.description, path: g.path })));

const moreGuides = computed<LinkItem[]>(() =>
	visibleGuides.value
		.filter(g => g.section !== 'start-here')
		.map(g => ({ title: guideTitle(g), description: g.description, path: g.path })));

const matchingTutorials = computed<LinkItem[]>(() => (tutorials.value ?? [])
	.filter(t => Array.isArray(t.technologies) && t.technologies.includes(props.slug))
	.sort((a, b) => a.title.localeCompare(b.title))
	.map(t => ({ title: t.title, description: t.description, path: t.path })));
</script>

<template>
	<div class="not-prose space-y-10">
		<section v-if="startHere.length">
			<ProseH2 id="start-here">
				Start Here
			</ProseH2>
			<FrameworkLinkList :items="startHere" />
		</section>

		<section v-if="moreGuides.length">
			<ProseH2 id="guides">
				Guides
			</ProseH2>
			<FrameworkLinkList :items="moreGuides" />
		</section>

		<section v-if="matchingTutorials.length">
			<ProseH2 id="framework-tutorials">
				{{ frameworkLabel }} Tutorials
			</ProseH2>
			<FrameworkLinkList :items="matchingTutorials" />
		</section>
	</div>
</template>
