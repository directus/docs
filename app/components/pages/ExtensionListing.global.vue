<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content';

interface Section {
	items?: Array<{ path: string }>;
}

const props = defineProps<{
	data: ParsedContent;
}>();

const paths: Array<string> = props.data.sections.flatMap((section: Section) =>
	section.items?.map(item => item.path) ?? [],
);

const pages = await queryContent().where({ _path: { $in: paths } }).only(['_path', 'title', 'description']).find();

const sections = props.data.sections.map((section: Section) => {
	const items = section.items?.map((item: { path: string }) => {
		const page = pages.find(page => page._path === item.path);
		return { ...item, title: page?.title, description: page?.description, _path: page?._path };
	});
	return { ...section, items };
});
</script>

<template>
	<div class="docs container">
		<UiAsideNav :path="data?._path" />
		<div class="slug">
			<main v-if="data">
				<article>
					<ContentRenderer :value="data">
						<ContentRendererMarkdown
							class="prose"
							:value="data"
						/>
					</ContentRenderer>
				</article>
				<section
					v-for="section in sections"
					:key="section.title"
				>
					<h2>{{ section.title }}</h2>
					<ArticlesGrid :articles="section.items" />
				</section>
			</main>
			<aside>
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
section {
	margin-top: 2rem;
	> h2 {
		margin-bottom: 1rem;
	}
}
</style>
