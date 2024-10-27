<script setup lang="ts">
interface Props {
	paths: string[];
	showDescription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showDescription: true,
});

const pages = await queryContent().where({ _path: { $in: props.paths } }).only(['_path', 'title', 'description']).find();

const items = props.paths.map((item) => {
	const page = pages.find(page => page._path === item);
	return {
		title: page?.title,
		description: props.showDescription ? page?.description : undefined,
		_path: page?._path,
	};
});
</script>

<template>
	<ArticlesGrid :articles="items" />
</template>
