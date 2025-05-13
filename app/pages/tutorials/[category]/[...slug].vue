<script setup lang="ts">
import type { ParsedContent } from "@nuxt/content";

definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const imageSrc = (page: ParsedContent | undefined) => {
	const technologies = page?.technologies || ['directus'];
	const techString = technologies.join(', ');
	return `/docs/api/tutorialimg?logos=${techString}`;
};

const headline = computed(() => findPageHeadline(page.value!));
console.log('headline', headline.value);
</script>

<template>
	<UPage>
		<UPageHeader
			:title="page!.title"
			:ui="{ title: 'title', headline: 'headline' }"
			:description="page!.description"
		>
			<template #headline>
				<NuxtLink to="/tutorials">
					Tutorials
				</NuxtLink>
				/
				<NuxtLink
					:href="`/tutorials/${page!._dir}`"
				>
					{{ headline }}
				</NuxtLink>
			</template>
			<img :src="imageSrc(page)" alt="Generated Image">
		</UPageHeader>

		<UPageBody
			class="content"
			prose
		>
			<ContentRenderer
				v-if="page!.body"
				:value="page"
			/>
		</UPageBody>

		<template
			v-if="page!.toc !== false"
			#right
		>
			<DocsToc
				:links="page!.body?.toc?.links"
				:authors="page!.authors"
				:file="page!._file!"
			/>
		</template>
	</UPage>
</template>
