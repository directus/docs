<script setup lang="ts">
definePageMeta({
	layout: 'docs',
});

const { data: nav } = await useAsyncData('frameworks-nav', () =>
	queryCollectionNavigation('content', ['icon']),
);

const { data: guides } = await useAsyncData('frameworks-guide-counts', () =>
	queryCollection('content')
		.where('path', 'LIKE', '/frameworks/%')
		.where('path', 'NOT LIKE', '%/.navigation')
		.where('stem', 'NOT LIKE', '%/index')
		.select('path')
		.all(),
);

type FrameworkCard = {
	slug: string;
	label: string;
	icon: string;
	count: number;
};

const frameworkCards = computed<FrameworkCard[]>(() => {
	const root = findNavNode(nav.value ?? undefined, '/frameworks');
	const items = root?.children ?? [];

	return items
		.filter(item => item.path && item.path !== '/frameworks')
		.map((item) => {
			const slug = item.path.split('/').filter(Boolean).pop() ?? '';
			const count = (guides.value ?? []).filter(g => g.path?.startsWith(`/frameworks/${slug}/`)).length;

			return {
				slug,
				label: item.title ?? slug,
				icon: item.icon ?? 'material-symbols:data-object',
				count,
			};
		});
});

await useDocsOgImage({
	title: 'Frameworks',
	description: 'Find Directus guides for your frontend framework, application stack, or platform.',
});
</script>

<template>
	<DocsPage>
		<UPageHeader
			title="Frameworks"
			description="Find Directus guides for the stack you are building with."
			:ui="{ headline: 'font-mono font-normal! uppercase tracking-wider' }"
		>
			<template #headline>
				<UBreadcrumb
					:items="[
						{ 'icon': 'material-symbols:home-outline', 'to': '/', 'aria-label': 'Home' },
						{ label: 'Frameworks' },
					]"
				>
					<template #separator>
						<span class="mx-2 text-muted">/</span>
					</template>
				</UBreadcrumb>
			</template>
		</UPageHeader>

		<UPageBody>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<UPageCard
					v-for="framework in frameworkCards"
					:key="framework.slug"
					:to="`/frameworks/${framework.slug}`"
					:icon="framework.icon"
					:title="framework.label"
					:ui="{
						title: 'font-bold text-pretty',
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
	</DocsPage>
</template>
