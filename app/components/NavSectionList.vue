<script setup lang="ts">
withDefaults(
	defineProps<{
		list: NavItems;
		highlightActive?: boolean;
	}>(),
	{
		highlightActive: true,
	},
);
</script>

<template>
	<ol :class="{ highlight: highlightActive }">
		<li
			v-for="link of list"
			:key="link._path"
		>
			<NuxtLink
				:to="link._path"
			>
				{{ link.title }}
			</NuxtLink>
			<NavSectionList
				v-if="link.children && link.children?.length > 1"
				:list="link.children.slice(1)"
			/>
		</li>
	</ol>
</template>

<style scoped>
ol {
	padding-left: 0;
	list-style-type: none;
	margin: 0;
}
ol ol {
	padding-left: 1rem;
}
a {
	display: block;
	text-decoration: none;
	margin-top: 0.5rem;
}
ol.highlight {
	a.router-link-active, a.highlight {
		/* TODO: USE SECTION COLORS */
		color: var(--primary);
		font-weight: 500;
		border-right: 2px solid var(--primary);
		margin-right: -2px;
	}
}
</style>
