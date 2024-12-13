<script setup lang="ts">
defineProps<{
	data: PageContent;
	allPages: AllPages;
	allNavigation: NavItems;
}>();

const isOpen = ref(false);
</script>

<template>
	<DefaultLayout>
		<template #mobile-nav>
			<AsideNav
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
				<AsideSlideover v-model="isOpen">
					<AsideTableOfContents
						v-if="data?.body?.toc && data?.body?.toc?.links?.length > 0"
						:toc="data.body.toc"
					/>
				</AsideSlideover>

				<article>
					<ContentRenderer :value="data">
						<div class="page-section-row">
							<span
								v-if="data._dir"
								v-title
								class="section-title"
							>
								{{ data._dir }}
							</span>

							<a
								v-if="data?.body?.toc && data?.body?.toc?.links?.length > 0"
								class="slideover-toggle"
								@click="isOpen = !isOpen"
							>
								<Icon name="material-symbols:menu" />
								On This Page
							</a>
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
				<div class="bottom-aside">
					<hr>
					<AsideFeedback />
					<hr>
					<AsideNewsletter />
					<AsideWidget />
				</div>
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
				<AsideWidget />
			</aside>
		</div>
	</DefaultLayout>
</template>

<style lang="scss" scoped>
.slideover-toggle {
	display: none;
	align-items: center;
	gap: 0.25rem;
	text-decoration: none;
	font-size: 0.75rem;
	color: var(--typography-subdued);
	cursor: pointer;
}

@media (max-width: 1024px) {
	.slideover-toggle{
		display: flex;
	}
}

.page-section-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.docs-grid {
	padding-top: 3rem;
	display: grid;
	grid-template-columns: 225px minmax(0, 1fr) 250px;
	gap: 3rem;
}

.left-aside {
	margin-top: 24px;
	border-right: 1px solid var(--border);
}

.left-aside-slide {
	border-right: 1px solid var(--border);
}

.main-content {
	margin-top: 24px;
	padding-bottom: 4rem;
}

.right-aside {
	margin-top: 24px;
	padding-left: 2rem;
	padding-right: 1em;
	border-left: 1px solid var(--border);
	display: flex;
	flex-direction: column;
	gap: 12px;
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

.bottom-aside {
	margin-top: 24px;
	display: none;
	flex-direction: column;
	gap: 12px;
}

@media (max-width: 1024px) {
	.bottom-aside {
		display: flex;
	}
}
</style>
