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
		to: '/cloud',
		dir: '/cloud',
		color: 'var(--section--cloud)',
	},
	{
		label: 'Tutorials',
		to: '/tutorials',
		dir: '/tutorials',
		color: 'var(--section--tutorials)',
	},
	{
		label: 'Community',
		to: '/community',
		dir: '/community',
		color: 'var(--section--community)',
	},
]);

const rightNav = [
	{
		label: 'Directus TV',
		href: 'https://directus.io/tv',
	},
	{
		label: 'Starter Kits',
		href: 'https://directus.io/tv',
	},
];

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
		<ul class="container">
			<li
				v-for="item in rightNav"
				:key="item.label"
			>
				<NuxtLink :to="item.href">
					{{ item.label }}
					<Icon name="material-symbols:open-in-new-rounded" />
				</NuxtLink>
			</li>
		</ul>
	</nav>
</template>

<style scoped>
.container {
  margin-left: 0px;
  margin-right: 0px;
}
nav {
  background: var(--background--subdued);
  box-shadow: inset 0 0 0 2px var(--border);
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: visible;

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
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  /* margin-bottom: -2px; */
  &:hover,
  &.active {
    color: var(--active-color);
    border-color: var(--active-color);
  }
}
</style>
