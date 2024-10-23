<script setup lang="ts">
import { formatTitle } from '@directus/format-title';

const props = defineProps<{
	data: PageContent;
}>();

const breadcrumbs = computed(() => {
	const paths = props.data._path.split('/').slice(1, -1);
	const breadcrumbs = paths.map((path, index) => {
		const name = formatTitle(path.replace(/-/g, ' '));
		const to = '/' + paths.slice(0, index + 1).join('/');
		return { name, to };
	});
	return breadcrumbs;
});
</script>

<template>
	<DefaultLayout>
		<div class="page-layout container">
			<div class="page">
				<div class="left-column">
					<main v-if="data">
						<div class="breadcrumbs">
							<NuxtLink
								v-for="(breadcrumb, index) in breadcrumbs"
								:key="breadcrumb.to"
								class="breadcrumb section-title"
								:to="breadcrumb.to"
							>
								{{ breadcrumb.name }}
								<Icon
									v-if="index < breadcrumbs.length - 1"
									name="material-symbols:chevron-right-rounded"
									class="breadcrumb-icon"
								/>
							</NuxtLink>
						</div>

						<article>
							<ContentRenderer :value="data">
								<div class="prose">
									<h1>
										{{ data.title }}
									</h1>
								</div>
								<div class="tags">
									<div
										v-for="tag in data.tags"
										:key="tag.id"
										class="tag"
									>
										<Icon :name="tag.icon" />
										{{ formatTitle(tag.name) }}
									</div>
								</div>
								<ContentRendererMarkdown
									class="prose"
									:value="data"
								/>
								<template #empty>
									<p>No content found.</p>
								</template>
							</ContentRenderer>
						</article>
					</main>
				</div>
				<aside class="right-aside">
					<template
						v-if="data?.body?.toc && data?.body?.toc?.links?.length > 0"
					>
						<AsideTableOfContents :toc="data.body.toc" />
						<hr>
					</template>
					<p
						v-if="data?.authors && data?.authors.length > 0"
						class="authors"
					>
						<span>Written by</span>
						<span
							v-for="author in data?.authors"
							:key="author.id"
							class="author"
						>
							<NuxtImg
								class="author-avatar"
								:src="img(author.avatar)"
								height="24"
								width="24"
							/>
							<span class="author-name">
								{{ author.name }}
							</span>
						</span>
					</p>
					<AsideFeedback />
					<hr>
					<AsideNewsletter />
				</aside>
			</div>
		</div>
	</DefaultLayout>
</template>

<style lang="scss" scoped>
.tags {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1rem;
	align-items: center;

	.tag {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background-color: var(--background-subdued);
		padding: 0.25rem 0.5rem;
		border-radius: var(--border-radius);
		border: 1px solid var(--border);
	}
}

.authors {
	font-size: 0.75rem;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	row-gap: 0rem;
	column-gap: 0.5rem;

	.author {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		max-width: 100%;

		.author-avatar {
			border-radius: 50%;
			object-fit: cover;
		}

		.author-name {
			font-weight: 500;
			white-space: nowrap;
		}
	}
}

.breadcrumbs {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	margin-bottom: 1rem;

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
		&:hover {
			color: var(--primary);
		}

		.breadcrumb-icon {
			font-size: 1rem;
		}
	}
}

.page {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 250px;
	width: 100%;
	gap: 3rem;
	overflow: clip;
}

.left-column {
	width: 100%;
	max-width: var(--width-md);
	margin-left: auto;
	margin-right: auto;
	display: flex;
	justify-content: center;
}

main {
	margin-top: 24px;
	max-width: 100%;
}
@media (max-width: 1024px) {
	.right-aside {
		display: none;
	}
	.page {
		display: block;
		padding-top: 1rem;
	}
}
.right-aside {
	margin-top: 24px;
	padding-left: 2rem;
	padding-right: 1em;
	border-left: 2px solid var(--border);
	display: flex;
	flex-direction: column;
	gap: calc(24px / 2);
	> * {
		width: 100%;
	}
}
.page-layout {
	margin-top: 24px;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 3rem;
}

:deep(ol ol) {
	display: none;
}
</style>
