<script setup lang="ts">
const props = defineProps<{ videoId: string }>();

interface Show {
	data: {
		vimeo_id: number;
		slug: string;
		season: {
			show: {
				slug: string;
				title: string;
			};
		};
	};
}

const show = await $fetch<Show>(
	`https://tv.directus.app/items/episodes/${props.videoId}?fields=vimeo_id,slug,season.show.slug,season.show.title`,
);
</script>

<template>
	<ClientOnly>
		<UCard class="w-full">
			<ScriptVimeoPlayer
				:id="show.data.vimeo_id"
				:root-attrs="{ style: { width: '100%' } }"
				above-the-fold
			>
				<template #awaitingLoad>
					<div class="absolute inset-0 flex items-center justify-center">
						<UButton
							icon="material-symbols:play-circle-outline"
							size="xl"
						/>
					</div>
				</template>

				<template #loading>
					<div class="absolute inset-0 flex items-center justify-center">
						<UButton
							loading
							size="xl"
						/>
					</div>
				</template>

				<template #error>
					<UAlert
						color="error"
						title="Video player failed to load"
						description="Please refresh the page to try again."
					/>
				</template>
			</ScriptVimeoPlayer>

			<template #footer>
				<ULink
					:href="`https://directus.io/tv/${show.data.season.show.slug}`"
					class="text-primary"
				>
					Watch {{ show.data.season.show.title }} on <LogoTv />
				</ULink>
			</template>
		</UCard>
	</ClientOnly>
</template>
