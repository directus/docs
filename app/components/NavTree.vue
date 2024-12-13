<script setup lang="ts">
import { TreeItem, TreeRoot } from 'radix-vue';

const props = defineProps<{
	items: NavItems;
	allPages: AllPages;
	allNavigation: NavItems;
}>();
const route = useRoute();

const resolvedRoute = computed(() =>
	resolveRoute(route.path, props.allPages, props.allNavigation),
);
</script>

<template>
	<TreeRoot
		v-slot="{ flattenItems }"
		style="list-style-type: none; padding-left: 0; white-space: nowrap"
		:items="items"
		:get-key="(item) => item.title"
		class="toc"
	>
		<TreeItem
			v-for="item in flattenItems"
			v-slot="{ isExpanded }"
			:key="item._id"
			:style="{ 'padding-left': `${item.level - 1}rem` }"
			v-bind="item.bind"
		>
			<div
				v-if="item.hasChildren"
				class="nested"
			>
				<div>
					{{ item.value.title }}
				</div>
				<Icon
					v-if="!isExpanded"
					name="material-symbols:keyboard-arrow-down-rounded"
					class="h-4 w-4"
				/>
				<Icon
					v-else
					name="material-symbols:keyboard-arrow-up-rounded"
					class="h-4 w-4"
				/>
			</div>
			<NuxtLink
				v-else
				:to="item.value._path"
				:class="{
					'active-link':
						route.path.startsWith(item.value._path)
						|| item.value.additional_paths?.includes(route.path)
						|| item.value._path == resolvedRoute,
				}"
			>
				{{ item.value.title }}
			</NuxtLink>
		</TreeItem>
	</TreeRoot>
</template>

<style scoped>
li {
	padding-left: 0;
	list-style-type: none;
	margin: 0;

	& + & {
		margin-top: 0.55rem;
	}
}

ol ol {
	padding-left: 1rem;
}

a {
	text-decoration: none;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 14px;
}

li div {
	display: block;
	text-decoration: none;
}

.dark-mode .active-link {
	color: var(--pink);
	font-weight: 500;
	border-right: 1px solid var(--pink);
	margin-right: -1px;
}

.active-link {
	color: var(--primary);
	font-weight: 500;
	border-right: 1px solid var(--primary);
	margin-right: -1px;
}

.nested {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding-top: 0.25rem;
	padding-bottom: 0.25rem;
	cursor: pointer;
	user-select: none;
}
</style>
