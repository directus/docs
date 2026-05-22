<script setup lang="ts">
definePageMeta({
	layout: 'tutorial',
});

const route = useRoute();
const menuDrawerOpen = ref(false);
watch(() => route.path, () => { menuDrawerOpen.value = false; });

const { mobileSectionNavigation, currentSection, allSectionItems } = useSectionNavigation();
const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path('/tutorials').first());

const { data: categories } = await useAsyncData(route.path + '-categories', () => queryCollection('content')
	.where('stem', 'LIKE', 'tutorials/%/index')
	.all());

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}
</script>

<template>
	<DocsPage>
		<div class="flex @min-[40rem]/docs-pane:hidden sticky top-(--ui-header-height) z-10 -mx-4 mb-4 items-center border-b border-dashed border-default bg-default/75 px-4 py-3 backdrop-blur">
			<UDrawer v-model:open="menuDrawerOpen" direction="left" side="left" inset :handle="false" :ui="{ content: 'w-full max-w-2/3' }">
				<UButton label="Menu" icon="material-symbols:menu" color="neutral" variant="link" size="xs" aria-label="Open navigation" />
				<template #body>
					<MobileNavSectionSwitcher :items="allSectionItems" :current-section="currentSection" />
					<p class="text-xs font-medium text-dimmed uppercase font-mono tracking-widest mb-2 flex items-center gap-1">
						<Icon v-if="currentSection?.icon" :name="currentSection?.icon" class="size-3.5" />
						{{ currentSection?.label }}
					</p>
					<UContentNavigation :navigation="mobileSectionNavigation" variant="link" highlight />
				</template>
			</UDrawer>
		</div>

		<UPageHeader
			:title="page!.title"
			:ui="{ headline: 'font-mono font-normal! uppercase tracking-wider' }"
		>
			<template #headline>
				<UBreadcrumb
					:items="[
						{ 'icon': 'material-symbols:home-outline', 'to': '/', 'aria-label': 'Home' },
						{ label: 'Tutorials' },
					]"
				>
					<template #separator>
						<span class="mx-2 text-muted">/</span>
					</template>
				</UBreadcrumb>
			</template>
			<template #description>
				<div class="max-w-prose">
					<ContentRenderer
						v-if="page!.body"
						:value="page!"
					/>
				</div>
			</template>
		</UPageHeader>

		<UPageBody prose>
			<TutorialsCategory
				v-for="category in categories"
				:key="category.path"
				:title="category.title!"
				:description="category.description!"
				:path="category.path!"
				:limit="6"
				class="mb-8 pb-8 last:mb-0 border-b border-gray-200 dark:border-gray-800"
			/>
		</UPageBody>
	</DocsPage>
</template>
