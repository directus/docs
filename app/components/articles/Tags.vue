<script setup lang="ts">
const props = defineProps<{
	allTags: {
		id: string;
		icon?: string;
		name: string;
	}[];
}>();

const { selectedTags, toggleTag, setTags, clearTags } = useTags();

function toggleAllTags() {
	if (selectedTags.value.length === props.allTags.length) {
		clearTags();
	}
	else {
		setTags(props.allTags.map(tag => tag.id));
	}
}
</script>

<template>
	<div>
		<div class="row">
			<h4>Tags</h4>
			<a
				style="cursor: pointer;"
				@click="toggleAllTags"
			>Toggle all</a>
		</div>
		<div
			v-for="tag in allTags"
			:key="tag.id"
			class="tag"
			:class="{ selected: selectedTags.includes(tag.id) }"
			@click="toggleTag(tag.id)"
		>
			<!-- checkbox icon -->
			<Icon
				v-if="selectedTags.includes(tag.id)"
				name="material-symbols:check-box"
			/>
			<Icon
				v-else
				name="material-symbols:check-box-outline-blank"
			/>
			<Icon :name="tag.icon || 'material-symbols:question-mark'" />
			<p>{{ tag.name }}</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
}

.tag {
	display: flex;
	align-items: center;
	gap: 0.5rem;

	&:hover {
		cursor: pointer;
		color: var(--purple);
	}

	&.selected {
		color: var(--purple);
	}
}

.flex-row {
	display: flex;
	gap: 1rem;
	align-items: flex-start;
}

.main-content {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 1rem;
}
</style>
