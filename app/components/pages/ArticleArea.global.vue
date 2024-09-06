<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content';

const props = defineProps<{
	data: ParsedContent;
}>();

const { data: navigation } = await useAsyncData('navigation' + props.data._path, () => fetchContentNavigation(queryContent({
	where: {
		_path: { $contains: props.data._path },
	},
})));

const area = computed(() => {
	if (!navigation.value) return null;
	return {
		title: navigation.value[0]?.title,
		_path: navigation.value[0]?._path,
		children: navigation.value[0]?.children,
	};
});

const categories = computed(() => {
	if (!area.value) return null;
	return area.value.children;
});
</script>

<template>
	<div class="docs container">
		<div class="slug">
			<main v-if="data">
				<p>
					You are in the {{ area?.title }} area and these are the categories within:
				</p>

				<div
					v-for="category in categories"
					:key="category._path"
				>
					<p style="margin-left: 15px;">
						<NuxtLink
							:to="category._path"
						>{{ data.title }} Category</NuxtLink> and these are the articles within:
					</p>
					<ul style="margin-left: 15px;">
						<ContentList
							v-slot="{ list }"
							:path="category._path"
						>
							<template
								v-for="page in list"
								:key="page._path"
							>
								<li v-if="page._path !== category._path">
									<NuxtLink
										:to="page._path"
									>
										{{ page.title }}
										&nbsp;
										Tags: (<span
											v-for="tag in page.tags"
											:key="tag.id"
										>
											<Icon :name="tag.icon" />
											{{ tag.name }}&nbsp;
										</span>)
									</NuxtLink>
								</li>
							</template>
						</ContentList>
					</ul>
				</div>
			</main>
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
	grid-template-columns: minmax(0, 1fr);
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
