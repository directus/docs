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
		/>

		<Callout
			class="w-6/12 my-10 font-bold"
			:to="path"
			icon="material-symbols:arrow-outward"
		>
			See all {{ title }} tutorials
		</Callout>
	</div>
</template>
