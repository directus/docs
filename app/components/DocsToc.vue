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
			<div class="hidden lg:block">
				<UDivider
					type="dashed"
					class="my-5"
				/>

				<template v-if="authors">
					<DocsTocAuthors :authors="authors" />
					<UDivider
						type="dashed"
						class="my-5"
					/>
				</template>

				<template v-if="toc.feedback">
					<DocsTocFeedback />
					<UDivider
						type="dashed"
						class="my-5"
					/>
				</template>

				<UPageLinks :links="communityLinks" />
			</div>
		</template>
	</UContentToc>
</template>
