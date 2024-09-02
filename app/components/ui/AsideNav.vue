<script setup>
const props = defineProps({
	path: {
		type: [String],
		required: true,
	},
});

const { data } = await useAsyncData('navigation', () =>
	fetchContentNavigation(),
);

const rootPath = props.path.split('/').slice(0, 2).join('/');

const navigation = computed(() => {
	const navTree = data.value.find(r => r._path === rootPath);

	if (navTree === undefined || navTree.root) {
		return data.value.filter(r => r?.root);
	}

	return navTree.children;
});
</script>

<template>
	<nav>
		<section
			v-for="section of navigation"
			:key="section._path"
			style="margin-bottom: 2rem"
		>
			<span class="section-title">{{ section.title }}</span>
			<nav>
				<UiNavTree :items="section.children" />
			</nav>
		</section>
	</nav>
</template>
