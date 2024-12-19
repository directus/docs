<script setup lang="ts">
const props = defineProps<{
	title: string;
	description: string;
	path: string;
}>();

const { data: articles } = await useAsyncData(props.path, () => queryContent(props.path).where({ _path: { $ne: props.path } }).only(['title', 'description', '_path']).limit(6).find());
</script>

<template>
	<div>
		<ProseH2 :id="slugify(title)">
			{{ title }}
		</ProseH2>
		<ProseP>
			{{ description }}
		</ProseP>

		<ULandingGrid class="mt-8">
			<ULandingCard
				v-for="article in articles"
				:key="article._path"
				:title="article.title!"
				:to="article._path!"
				class="col-span-4"
				:ui="{
					title: 'text-gray-900 dark:text-white text-base font-bold text-balance',
				}"
			>
				<template #icon>
					<UBadge color="gray">
						{{ title }}
					</UBadge>
				</template>
			</ULandingCard>

			<Callout
				class="col-span-6 mt-6 font-bold"
				:to="path"
				icon="material-symbols:arrow-outward"
			>
				See all {{ title }} tutorials
			</Callout>
		</ULandingGrid>
	</div>
</template>
