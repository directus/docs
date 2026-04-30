<script setup lang="ts">
import { frameworks, hasFrameworkTechnology } from '~/utils/frameworks';

definePageMeta({
	layout: 'docs',
});

const { data: guides } = await useAsyncData('framework-guides-index', () =>
	queryCollection('content')
		.where('path', 'LIKE', '/frameworks/%')
		.select('technologies')
		.all(),
);

const frameworkCards = computed(() => frameworks.map(framework => ({
	...framework,
	count: (guides.value ?? []).filter(guide => hasFrameworkTechnology(guide, framework)).length,
})));

useSeoMeta({
	title: 'Frameworks',
	description: 'Find Directus guides for your frontend framework, application stack, or platform.',
});
</script>

<template>
	<UPage>
		<UPageHeader
			title="Frameworks"
			description="Find Directus guides for the stack you are building with."
			:ui="{ title: 'title' }"
		/>

		<UPageBody>
			<ProseH2 id="all-frameworks">
				All frameworks
			</ProseH2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<UPageCard
					v-for="framework in frameworkCards"
					:key="framework.slug"
					:to="`/frameworks/${framework.slug}`"
					:icon="framework.icon"
					:title="framework.label"
					:description="framework.description"
					:ui="{
						title: 'font-bold text-pretty',
						description: 'line-clamp-2',
						container: 'p-4 md:p-4 lg:p-4',
					}"
					class="hover:bg-primary/5 hover:ring-primary"
				>
					<template #footer>
						<span class="text-sm text-gray-500 dark:text-gray-400">
							{{ framework.count }} {{ framework.count === 1 ? 'guide' : 'guides' }}
						</span>
					</template>
				</UPageCard>
			</div>
		</UPageBody>

	</UPage>
</template>
