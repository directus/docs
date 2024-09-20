<script setup lang="ts">
defineProps<{
	data: PageContent;
	allPages: AllPages;
	allNavigation: NavItems;
}>();
</script>

<template>
	<div class="docs container">
		<UiAsideNav
			:path="data._path"
			:all-pages="allPages"
			:all-navigation="allNavigation"
		/>
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
					:toc="data.body.toc"
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
	margin-top: 24px;
	.prev-next {
		padding: 24px 0 calc(24px + 1rem);
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
.docs {
	padding-top: 3rem;
	padding-bottom: 6rem;
	display: grid;
	grid-template-columns: 225px minmax(0, 1fr);
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
