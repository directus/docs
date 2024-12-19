<script setup lang="ts">
import type { TocLink } from '@nuxt/content';

const props = defineProps<{
	links: TocLink[] | undefined;
	authors: { name: string; title: string }[] | undefined;
	file: string;
}>();

const { toc } = useAppConfig();

const communityLinks = computed(() => {
	return [
		{
			icon: 'material-symbols:edit-document-outline',
			label: 'Edit this page',
			to: `https://github.com/directus/docs/edit/main/content/${props.file}`,
		},
		...toc.links,
	];
});
</script>

<template>
	<UContentToc
		:title="toc.title"
		:links="links"
	>
		<template #bottom>
			<UDivider type="dashed" />

			<template v-if="authors">
				<DocsTocAuthors :authors="authors" />
				<UDivider type="dashed" />
			</template>

			<template v-if="toc.feedback">
				<DocsTocFeedback />
				<UDivider type="dashed" />
			</template>

			<UPageLinks :links="communityLinks" />
		</template>
	</UContentToc>
</template>
