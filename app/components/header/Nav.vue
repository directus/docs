<script setup>
const nav = ref([
	{
		label: 'Developer Docs',
		to: '/',
		color: 'var(--section--dev-docs)',
		active: true,
	},
	{
		label: 'API Reference',
		to: '/api',
		color: 'var(--section--api-reference)',
	},
	{
		label: 'Directus Cloud',
		to: '/cloud',
		color: 'var(--section--cloud)',
	},
	{
		label: 'Tutorials',
		to: '/tutorials',
		color: 'var(--section--tutorials)',
	},
	{
		label: 'Community',
		to: '/community',
		color: 'var(--section--community)',
	},
]);
</script>

<template>
	<nav>
		<ul class="container">
			<li
				v-for="item in nav"
				:key="item.label"
			>
				<NuxtLink
					:to="item.to"
					:class="{ active: item.active }"
					:style="`--active-color: ${item.color}`"
				>
					{{ item.label }}
				</NuxtLink>
			</li>
		</ul>
	</nav>
</template>

<style scoped>
nav {
	background: var(--background--subdued);
	border: 2px solid var(--border);
}
ul {
	list-style-type: none;
	display: flex;
	font-size: var(--nav-font);
	gap: 2rem;
}
a {
	text-decoration: none;
	padding: var(--nav-padding) 0;
	display: inline-block;
	border-bottom: 2px solid transparent;
	font-weight: 500;
	margin-bottom: -2px;
	&:hover, &.active {
		color: var(--active-color);
		border-color: var(--active-color);
	}
}
</style>
