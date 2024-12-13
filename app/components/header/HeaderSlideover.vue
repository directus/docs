<script lang="ts" setup>
const isOpen = defineModel<boolean>();

type AreaNavigation = {
	label: string;
	to?: string;
	href?: string;
	dir?: string;
	color?: string;
	icon: string;
	active?: boolean;
};

const nav = ref<AreaNavigation[]>([
	{
		label: 'Developer Docs',
		to: '/',
		dir: '/',
		icon: 'material-symbols:book-5-rounded',
		color: 'var(--area--dev-docs)',
	},
	{
		label: 'API Reference',
		to: '/api',
		dir: '/api',
		icon: 'material-symbols:code-blocks-rounded',
		color: 'var(--area--api-reference)',
	},
	{
		label: 'Directus Cloud',
		to: '/cloud',
		dir: '/cloud',
		icon: 'material-symbols:cloud',
		color: 'var(--area--cloud)',
	},
	{
		label: 'Tutorials',
		to: '/tutorials',
		dir: '/tutorials',
		icon: 'material-symbols:school-outline',
		color: 'var(--area--tutorials)',
	},
	{
		label: 'Community',
		to: '/community',
		dir: '/community',
		icon: 'material-symbols:groups',
		color: 'var(--area--community)',
	},
	{
		label: 'Directus TV',
		icon: 'material-symbols:tv-outline-rounded',
		href: 'https://directus.io/tv',
	},
	{
		label: 'Templates',
		icon: 'material-symbols:service-toolbox',
		href: 'https://directus.io/templates',
	},
]);

const route = useRoute();

const navItems = computed(() => {
	let hasMatch = false;

	const updatedNav = nav.value.map((item) => {
		if (!item.href) {
			item = item as AreaNavigation;
			if (item.dir && route.path.startsWith(item.dir) && item.dir !== '/') {
				item.active = true;
				hasMatch = true;
			}
			else {
				item.active = false;
			}
		}
		return item;
	});

	// If no match was found, set the first item as active only if the path is '/'
	if (!hasMatch && updatedNav[0] && (updatedNav[0] as AreaNavigation).dir) {
		(updatedNav[0] as AreaNavigation).active = true;
	}

	return updatedNav;
});
</script>

<template>
	<div>
		<div
			class="slideover"
			:style="`transform: translateX(${isOpen ? '0' : '-100%'})`"
		>
			<div class="slideover-header">
				<NuxtLink to="/">
					<HeaderLogo />
				</NuxtLink>
				<button
					class="slideover-toggle"
					@click="isOpen = !isOpen"
				>
					<Icon name="material-symbols:close" />
				</button>
			</div>
			<div class="nav-scroll">
				<nav class="slideover-nav">
					<ul>
						<li
							v-for="item in navItems"
							:key="item.label"
						>
							<NuxtLink
								:to="item.to || item.href"
								:external="!!item.href"
								:target="item.href ? '_blank' : undefined"
								:class="['nav-item', item.active ? 'active' : '']"
								:style="{ '--list-color': item.color }"
							>
								<!-- Icon -->
								<div
									class="nav-icon"
								>
									<Icon :name="item.icon" />
								</div>

								<!-- Label -->
								<span class="nav-label">
									{{ item.label }}
									<Icon
										v-if="item.href"
										name="material-symbols:open-in-new-rounded"
									/>
								</span>
							</NuxtLink>
						</li>
					</ul>
				</nav>

				<div class="docs-nav-holder">
					<slot />
				</div>
			</div>
		</div>
		<div
			class="background-overlay"
			:class="{ hidden: !isOpen }"
			@click="isOpen = false"
		/>
	</div>
</template>

<style scoped>
ul {
	list-style-type: none;
	font-size: 14px;
	gap: 2rem;
}

a {
	text-decoration: none;
}

.slideover {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	background-color: var(--background);
	padding-left: 1.5rem;
	padding-bottom: 1rem;
	padding-top: 0.5rem;
	z-index: 1000;
	min-width: 75vw;
	transition: transform 0.3s ease;
}

.nav-scroll {
	overflow-y: auto;
	height: 100%;
	padding-right: 1rem;
	scrollbar-color: var(--border-subtle) var(--background);
}

.slideover-nav {
	padding-top: 1rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--border);
}

ul {
	list-style: none;
	padding: 0;
	margin: 0;
}

.nav-item {
	display: flex;
	align-items: center;
	padding-top: 10px;
	padding-bottom: 10px;
	border-radius: 8px;
	transition: all 0.2s ease, color 0.2s ease;
	cursor: pointer;
	color: var(--typography)
}

.nav-item:hover {
	color: var(--list-color);
}

.nav-item.active {
	color: var(--list-color);
}

.nav-icon {
	width: 24px;
	height: 24px;
	border-radius: 8px;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 10px;
	border: 1px solid var(--border-subdued);
	color: var(--list-color)
}

.nav-label {
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.nav-item.active .nav-label {
	color: var(--list-color);
	font-weight: 600;
}

.nav-item:hover .nav-icon {
	border: 1px solid var(--list-color, var(--typography));
}

.nav-item.active .nav-icon {
	border: 1px solid var(--list-color, var(--typography));
}

.docs-nav-holder {
	padding-top: 1rem;
}

.background-overlay {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background-color: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(5px);
	z-index: 999;
}

.hidden {
	display: none;
}

.slideover-toggle {
	background: none;
	border: none;
	color: color-mix(in hsl shorter hue, var(--white) 60%, var(--black) 40%);;
	font-size: 1.5rem;
	cursor: pointer;
	height: 40px;
	width: 40px;
}

.slideover-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
