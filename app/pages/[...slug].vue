<script setup lang="ts">
const route = useRoute();

const { data } = await useAsyncData(route.path, () =>
	queryContent(route.path).findOne(),
);
if (!data.value) {
	throw createError({
		statusCode: 404,
		fatal: true,
	});
}

definePageMeta({});

useSeoMeta({
	title: data.value.title,
	description: data.value.description,
});

// defineOgImage({
// 	component: 'Docs',
// 	title: data.value.title,
// 	description: data.value.description,
// });
</script>

<template>
	<div class="docs container">
		<UiAsideNav :path="route.path" />
		<div class="slug">
			<main v-if="data">
				<article>
					<ContentRenderer :value="data">
						<span
							v-if="data._dir"
							v-title
							class="section-title"
						>
							{{ data._dir }}
						</span>
						<ContentRendererMarkdown
							class="prose"
							:value="data"
						/>
						<template #empty>
							<p>No content found.</p>
						</template>
					</ContentRenderer>
				</article>
				<PrevNext />
			</main>
			<aside>
				<AsideTableOfContents
					v-if="data?.body?.toc && data?.body?.toc?.links?.length > 0"
					:toc="data?.body?.toc"
				/>
				<AsideNewsletter />
				<AsideFeedback />
			</aside>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.slug {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 250px;
	width: 100%;
	gap: 3rem;
}
main {
	margin-top: var(--nav-spacing-under);
	.prev-next {
		padding: var(--nav-spacing-under) 0 calc(var(--nav-spacing-under) + 1rem);
	}
}
aside {
	margin-top: var(--nav-spacing-under);
	padding-left: 2rem;
	padding-right: 1em;
	border-left: 2px solid var(--border);
	display: flex;
	flex-direction: column;
	gap: calc(var(--nav-spacing-under) / 2);
	> * {
		width: 100%;
	}
}
.docs {
	display: grid;
	grid-template-columns: 225px minmax(0, 1fr);
	gap: 3rem;
	> nav {
		margin-top: var(--nav-spacing-under);
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
