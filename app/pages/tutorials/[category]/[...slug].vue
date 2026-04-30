<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import { findPageBreadcrumb } from '@nuxt/content/utils';

const navigation = inject('navigation') as Ref<ContentNavigationItem[]>;

definePageMeta({
	layout: 'tutorial',
});

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

const breadcrumb = computed(() =>
	(findPageBreadcrumb(navigation.value, path.value) ?? []).map(item => ({
		label: item.title,
		to: item.path,
	})),
);

const frameworkChips = computed(() => {
	const tech = (page.value as { technologies?: string[] } | null)?.technologies ?? [];
	const root = findNavNode(navigation.value, '/frameworks');
	const frameworks = root?.children ?? [];
	return tech
		.map((slug) => {
			const node = frameworks.find(f => f.path === `/frameworks/${slug}`);
			if (!node) return null;
			return {
				label: node.title,
				icon: (node as { icon?: string }).icon,
				to: node.path,
			};
		})
		.filter((c): c is { label: string; icon?: string; to: string } => Boolean(c));
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
	<UPage>
		<UPageHeader
			:title="page!.title"
			:ui="{ title: 'title', headline: 'headline' }"
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
	</UPage>
</template>
