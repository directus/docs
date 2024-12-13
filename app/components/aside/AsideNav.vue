<script setup lang="ts">
const props = defineProps<{
	path: string;
	allPages: AllPages;
	allNavigation: NavItems;
}>();

const rootPath = props.path.split('/').slice(0, 2).join('/');

const recursiveRemoveChildrenIfNotExpandable = (item: NavItem) => {
	if (item.children) {
		item.children = item.children.map((child) => {
			return {
				...child,
				...(!child.expandable && child.children && { children: undefined }),
			};
		});
		item.children = item.children.map(recursiveRemoveChildrenIfNotExpandable);
	}
	return item;
};

const navigation = computed(() => {
	const navTree = props.allNavigation.find(r => r._path === rootPath);

	if (navTree === undefined || navTree.root) {
		return (
			props.allNavigation
				.filter(r => r?.root)
				.map(recursiveRemoveChildrenIfNotExpandable) || []
		);
	}

	return navTree.children?.map(recursiveRemoveChildrenIfNotExpandable) || [];
});
</script>

<template>
	<nav>
		<section
			v-for="section of navigation"
			:key="section._path"
		>
			<p
				v-if="section.children"
				class="section-title"
			>
				{{ section.title }}
			</p>
			<nav>
				<NavTree
					v-if="section.children"
					:items="section.children"
					:all-pages="allPages"
					:all-navigation="allNavigation"
				/>
			</nav>
		</section>
	</nav>
</template>

<style scoped>
section {
	margin-bottom: 2rem;
}

.section-title {
	margin-bottom: 0.6rem;
}
</style>
