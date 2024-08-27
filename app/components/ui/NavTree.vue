<script setup lang="ts">
import { TreeItem, TreeRoot } from 'radix-vue';

const props = defineProps<{ items: any[] }>();
</script>

<template>
	<TreeRoot
		v-slot="{ flattenItems }"
		style="list-style-type: none; padding-left: 0; white-space: nowrap;"
		:items="items"
		:get-key="(item) => item.title"
		:default-expanded="['components']"
		class="toc"
	>
		<TreeItem
			v-for="item in flattenItems"
			v-slot="{ isExpanded }"
			:key="item._id"
			:style="{ 'padding-left': `${(item.level - 1)}rem` }"
			v-bind="item.bind"
			style=""
		>
			<div
				v-if="item.hasChildren"
				style="display: flex; align-items: center; gap: 0.5rem; padding-top: 0.25rem; padding-bottom: 0.25rem;"
			>
				<Icon
					v-if="item.icon"
					:name="item.icon"
				/>
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
				style="display: flex; align-items: center; gap: 0.5rem; padding-top: 0.25rem; padding-bottom: 0.25rem;"
			>
				<Icon
					v-if="item.icon"
					:name="item.icon"
				/>
				<div>
					{{ item.value.title }}
				</div>
			</NuxtLink>
		</TreeItem>
	</TreeRoot>
</template>

<style scoped>
li {
	padding-left: 0;
	list-style-type: none;
	margin: 0;
}
ol ol {
	padding-left: 1rem;
}
a {
	text-decoration: none;
}
li div {
	display: block;
	text-decoration: none;
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
