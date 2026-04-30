<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

const props = defineProps<{
	slug: string;
}>();

const navigation = inject('navigation') as Ref<ContentNavigationItem[]> | undefined;

const findNavNode = (items: ContentNavigationItem[] | undefined, target: string): ContentNavigationItem | undefined => {
	if (!items) return undefined;
	for (const item of items) {
		if (item.path === target) return item;
		const child = findNavNode(item.children, target);
		if (child) return child;
	}
	return undefined;
};

const frameworkLabel = computed(() => {
	const node = findNavNode(navigation?.value, `/frameworks/${props.slug}`);
	return node?.title ?? props.slug;
});

const { data: guides } = await useAsyncData(`framework-${props.slug}-guides`, () =>
	queryCollection('content')
		.where('path', 'LIKE', `/frameworks/${props.slug}/%`)
		.where('path', 'NOT LIKE', '%/.navigation')
		.where('stem', 'NOT LIKE', '%/index')
		.select('title', 'description', 'path', 'navigation', 'stem')
		.order('stem', 'ASC')
		.all(),
);

const { data: tutorials } = await useAsyncData(`framework-${props.slug}-tutorials`, () =>
	queryCollection('content')
		.where('path', 'LIKE', '/tutorials/%')
		.select('title', 'description', 'path', 'stack')
		.all(),
);

type Item = {
	title?: string;
	description?: string;
	path?: string;
	navigation?: boolean | { title?: string };
	stem?: string;
	stack?: string[];
};

const guideTitle = (g: Item) =>
	(typeof g.navigation === 'object' && g.navigation?.title) ? g.navigation.title : g.title;

const stemPosition = (stem?: string) => {
	const last = stem?.split('/').pop() ?? '';
	const match = /^(\d+)\./.exec(last);
	return match ? Number(match[1]) : 999;
};

const visibleGuides = computed(() => (guides.value ?? [])
	.filter((g): g is Item => Boolean(g.path) && g.navigation !== false));

const startHere = computed(() =>
	visibleGuides.value.filter(g => stemPosition(g.stem) < 10));

const moreGuides = computed(() =>
	visibleGuides.value.filter(g => stemPosition(g.stem) >= 10));

const matchingTutorials = computed(() => (tutorials.value ?? [])
	.filter(t => Array.isArray(t.stack) && t.stack.includes(props.slug))
	.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '')));
</script>

<template>
	<div class="not-prose space-y-10">
		<section v-if="startHere.length">
			<ProseH2 id="start-here">
				Start Here
			</ProseH2>
			<ul class="divide-y divide-default rounded-lg border border-default">
				<li
					v-for="guide in startHere"
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

		<section v-if="moreGuides.length">
			<ProseH2 id="guides">
				Guides
			</ProseH2>
			<ul class="divide-y divide-default rounded-lg border border-default">
				<li
					v-for="guide in moreGuides"
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

		<section v-if="matchingTutorials.length">
			<ProseH2 id="framework-tutorials">
				{{ frameworkLabel }} Tutorials
			</ProseH2>
			<p class="text-sm text-muted">
				Longer-form builds and community walkthroughs.
			</p>
			<ul class="mt-4 space-y-2">
				<li
					v-for="tutorial in matchingTutorials"
					:key="tutorial.path"
				>
					<NuxtLink
						:to="tutorial.path"
						class="text-primary hover:underline"
					>
						{{ tutorial.title }}
					</NuxtLink>
				</li>
			</ul>
		</section>
	</div>
</template>
