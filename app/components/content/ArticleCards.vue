<script setup lang="ts">
const props = defineProps<{
	paths: string[];
}>();

const pages = await queryContent().where({ _path: { $in: props.paths } }).only(['_path', 'title', 'description']).find();

const items = props.paths.map((item) => {
	const page = pages.find(page => page._path === item);
	return {
		title: page?.title,
		description: page?.description,
		_path: page?._path,
	};
});
</script>

<template>
	<ArticlesGrid :articles="items" />
</template>
