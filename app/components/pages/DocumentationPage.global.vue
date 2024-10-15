<script setup lang="ts">
defineProps<{
	data: PageContent;
	allPages: AllPages;
	allNavigation: NavItems;
}>();
</script>

<template>
	<DefaultLayout>
		<template #mobile-nav>
			<UiAsideNav
				class="left-aside-slide"
				:path="data._path"
				:all-pages="allPages"
				:all-navigation="allNavigation"
			/>
		</template>

		<div class="docs-grid container">
			<AsideNav
				class="left-aside"
				:path="data._path"
				:all-pages="allPages"
				:all-navigation="allNavigation"
			/>
			<main
				v-if="data"
				class="main-content"
			>
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
			</main>
			<aside class="right-aside">
				<AsideTableOfContents
					v-if="data?.body?.toc && data?.body?.toc?.links?.length > 0"
					:toc="data.body.toc"
				/>
				<hr>
				<AsideFeedback />
				<hr>
				<AsideNewsletter />
			</aside>
		</div>
	</DefaultLayout>
</template>

<style lang="scss" scoped>
.docs-grid {
	padding-top: 3rem;
	padding-bottom: 6rem;
	display: grid;
	grid-template-columns: 225px minmax(0, 1fr) 250px;
	gap: 3rem;
}

.left-aside {
	margin-top: 24px;
	border-right: 2px solid var(--border);
}

.left-aside-slide {
	border-right: 2px solid var(--border);
}

.main-content {
	margin-top: 24px;
}

.right-aside {
	margin-top: 24px;
	padding-left: 2rem;
	padding-right: 1em;
	border-left: 2px solid var(--border);
	display: flex;
	flex-direction: column;
	gap: calc(24px / 2);
}

.right-aside > * {
	width: 100%;
}

@media (max-width: 1024px) {
	.right-aside {
		display: none;
	}
	.docs-grid {
		grid-template-columns: 225px 1fr;
		padding-top: 2rem;
	}
}

@media (max-width: 768px) {
	.docs-grid {
		grid-template-columns: 1fr;
		padding-top: 1rem;
	}

	.left-aside,
	.right-aside {
		display: none;
	}
}
</style>
