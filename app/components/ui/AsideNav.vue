<script setup>
const props = defineProps({
	directory: {
		type: [String],
		required: true,
	},
});

const { data } = await useAsyncData('navigation', () => fetchContentNavigation());

const navigation = data.value.find(r => r._path === props.directory).children;
</script>

<template>
	<nav>
		<section
			v-for="section of navigation"
			:key="section._path"
			style="margin-bottom: 2rem;"
		>
			<span class="section-title">{{ section.title }}</span>
			<nav>
				<UiNavTree :items="section.children" />
			</nav>
		</section>
	</nav>
</template>
