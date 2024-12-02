<script setup lang="ts">
type AreaNavigation = {
	label: string;
	to: string;
	dir: string;
	color: string;
	active?: boolean;
};

const nav = ref<AreaNavigation[]>([
	{
		label: 'Developer Docs',
		to: '/',
		dir: '/',
		color: 'var(--area--dev-docs)',
	},
	{
		label: 'API Reference',
		to: '/api',
		dir: '/api',
		color: 'var(--area--api-reference)',
	},
	{
		label: 'Directus Cloud',
		to: '/cloud',
		dir: '/cloud',
		color: 'var(--area--cloud)',
	},
	// {
	// 	label: 'Tutorials',
	// 	to: '/tutorials',
	// 	dir: '/tutorials',
	// 	color: 'var(--area--tutorials)',
	// },
	{
		label: 'Community',
		to: '/community',
		dir: '/community',
		color: 'var(--area--community)',
	},
]);

const rightNav = [
	{
		label: 'Directus TV',
		href: 'https://directus.io/tv',
	},
	{
		label: 'Starter Kits',
		href: 'https://directus.io/plus',
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
	if (!hasMatch && updatedNav[0]) {
		updatedNav[0].active = true;
	}

	return updatedNav;
});
</script>

<template>
	<nav class="desktop-nav">
		<div class="nav-container">
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
		</div>
	</nav>
</template>

<style scoped>
.container {
	margin-left: 0px;
	margin-right: 0px;
}

.nav-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-width: var(--width-2xl);
	width: 100%;
	margin-left: auto;
	margin-right: auto;
}
.desktop-nav {
	background: var(--background-subdued);
	box-shadow: inset 0 0 0 1px
		color-mix(in srgb, var(--border) 50%, var(--border-subdued) 50%);
	display: flex;

	white-space: nowrap;
	overflow-x: auto;
	overflow-y: visible;
	scrollbar-width: thin;
}
ul {
	list-style-type: none;
	display: flex;
	font-size: 14px;
	gap: 2rem;
}
a {
	text-decoration: none;
	padding: 8px 0;
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	border-bottom: 1px solid transparent;
	font-weight: 500;
	&:hover,
	&.active {
		color: var(--active-color);
		border-color: var(--active-color);
	}
}

@media (max-width: 768px) {
	.desktop-nav {
		display: none;
	}
}
</style>
