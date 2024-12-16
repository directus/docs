<script lang="ts" setup>
defineProps<{
	article: CardItem;
}>();
</script>

<template>
	<NuxtLink
		:to="article._path"
		:external="!article._path.startsWith('/')"
		:target="article._path.startsWith('/') ? undefined : '_blank'"
		class="article-card"
	>
		<p class="card-title">
			{{ article.title }}
		</p>

		<p
			v-if="article.description"
			class="card-description"
		>
			{{ article.description }}
		</p>

		<div
			v-if="article.tags || article.category"
			class="card-footer-row"
		>
			<div
				v-if="article.tags"
				class="card-tag-row"
			>
				<span
					v-for="tag in article.tags"
					:key="tag.id"
					class="card-tag"
					:title="tag.name"
				>
					<Icon :name="tag.icon || 'material-symbols:question-mark'" />
				</span>
			</div>
			<p
				v-if="article.category"
				class="card-category"
			>
				{{ article.category }}
			</p>
		</div>
	</NuxtLink>
</template>

<style lang="scss" scoped>
.article-card {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: start;
	padding: 1rem;
	border-radius: 0.5rem;
	transition: background-color 0.2s ease-in-out;
	text-decoration: none;

	border: 1px solid var(--border-subdued);

	.card-title {
		font-size: 1rem;
		font-weight: 500;
		margin-bottom: 0rem;
	}

	.card-description {
		font-size: 0.875rem;
		font-weight: 400;
		margin-bottom: 0;
	}

	.card-footer-row {
		margin-top: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: end;
		flex-grow: 1;
	}

	.card-tag-row {
		display: flex;
		align-items: center;
	}

	.card-tag {
		display: flex;
		align-items: center;
		margin-right: 0.5rem;

		&:last-child {
			margin-right: 0;
		}

		& > * {
			margin-right: 0.25rem;
		}
	}

	.card-category {
		font-size: 0.75rem;
		font-weight: 400;
		background-color: var(--background-subdued);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
	}

	&:hover {
		background-color: var(--background-subdued);
		border-color: var(--border-subtle);
	}
}
</style>
