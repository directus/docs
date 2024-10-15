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
				<aside class="right-aside">
					<template v-if="data?.body?.toc && data?.body?.toc?.links?.length > 0">
						<AsideTableOfContents
							:toc="data.body.toc"
						/>
						<hr>
					</template>
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
main {
	margin-top: 24px;
	.prev-next {
		padding: 24px 0 calc(24px + 1rem);
	}
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
aside {
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
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 3rem;
	> nav {
		margin-top: 24px;
		border-right: 2px solid var(--border);
		section {
			margin: 2rem 0;
			&:first-child {
				margin-top: 0;
			}
		}
	}
}
:deep(ol ol) {
	display: none;
}
</style>
