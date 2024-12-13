<script setup lang="ts">
interface Props {
	paths: (string | CardItem)[];
	showDescription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showDescription: true,
});

const pages = await queryContent().where({ _path: { $in: props.paths.filter(
	item => typeof item === 'string',
) } }).only(['_path', 'title', 'description']).find();

const items = props.paths.map((item) => {
	if (typeof item !== 'string') {
		return item;
	}

	const page = pages.find(page => page._path === item);
	if (!page) {
		return;
	}
	return {
		title: page.title!,
		description: page?.description,
		_path: page._path!,
	};
}).filter(item => !!item).map((item) => {
	if (props.showDescription === false) {
		delete item.description;
	}
	return item;
}) as CardItem[];
</script>

<template>
	<ArticlesGrid :articles="items" />
</template>
