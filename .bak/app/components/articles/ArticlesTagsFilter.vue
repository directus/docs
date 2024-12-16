<script setup lang="ts">
import { formatTitle } from '@directus/format-title';

const props = defineProps<{
	tags: ArticleTags;
}>();

const { selectedTags, toggleTag, setTags, clearTags } = useTags();

function toggleAllTags() {
	if (selectedTags.value.length === props.tags.length) {
		clearTags();
	}
	else {
		setTags(props.tags.map(tag => tag.name));
	}
}
</script>

<template>
	<div>
		<div class="filter-header">
			<p class="section-title">
				Filter
			</p>
			<a
				class="toggle-all"
				@click="toggleAllTags"
			>
				Toggle all
			</a>
		</div>
		<div
			v-for="tag in tags"
			:key="tag.id"
			class="tag"
			:class="{ selected: selectedTags.includes(tag.name) }"
			@click="toggleTag(tag.name)"
		>
			<Icon
				v-if="selectedTags.includes(tag.name)"
				name="material-symbols:check-box"
			/>
			<Icon
				v-else
				name="material-symbols:check-box-outline-blank"
			/>
			<Icon :name="tag.icon || 'material-symbols:question-mark'" />
			<p>{{ formatTitle(tag.name) }}</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.filter-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	margin-bottom: 0.5rem;
}

.toggle-all {
	cursor: pointer;
	color: var(--typography-subdued);
	font-size: 0.85rem;
}

.tag {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.25rem;

	&:hover {
		cursor: pointer;
		color: var(--purple);
	}

	&.selected {
		color: var(--purple);
	}
}
</style>
