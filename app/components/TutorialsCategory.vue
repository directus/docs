<script setup lang="ts">
defineProps<{
	title: string;
	description: string;
	path: string;
	limit?: number;
}>();
</script>

<template>
	<div>
		<ProseH2 :id="slugify(title)">
			{{ title }}
		</ProseH2>
		<ProseP>
			{{ description }}
		</ProseP>

		<TutorialsArticles
			:limit="limit"
			:path="path"
			:category-title="title"
			:show-more="true"
		/>

		<ProseCallout
			class=" my-10 font-bold"
			:to="path"
			icon="material-symbols:arrow-outward"
		>
			See all {{ title }} tutorials
		</ProseCallout>
	</div>
</template>
