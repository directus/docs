<script setup>
const nav = ref([
	{
		label: 'Developer Docs',
		to: '/',
		dir: '/',
		color: 'var(--section--dev-docs)',
	},
	{
		label: 'API Reference',
		to: '/api',
		dir: '/api',
		color: 'var(--section--api-reference)',
	},
	{
		label: 'Directus Cloud',
		to: '/cloud/projects/accounts',
		dir: '/cloud',
		color: 'var(--section--cloud)',
	},
	{
		label: 'Tutorials',
		to: '/tutorials/example/example',
		dir: '/tutorials',
		color: 'var(--section--tutorials)',
	},
	{
		label: 'Community',
		to: '/community/example/example',
		dir: '/community',
		color: 'var(--section--community)',
	},
]);

const route = useRoute();

const navItems = computed(() => {
	let hasMatch = false;

	const updatedNav = nav.value.map((item) => {
		if (route.path.startsWith(item.dir) && item.dir !== '/') {
			item.active = true;
			hasMatch = true;
		}
		else {
			item.active = false;
		}
		return item;
	});

	// If no match was found, set the first item as active only if the path is '/'
	if (!hasMatch) {
		updatedNav[0].active = true;
	}

	return updatedNav;
});
</script>

<template>
	<nav>
		<ul class="container">
			<li
				v-for="item in navItems"
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
  &:hover,
  &.active {
    color: var(--active-color);
    border-color: var(--active-color);
  }
}
</style>
