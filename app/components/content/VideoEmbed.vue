<script setup lang="ts">
const props = defineProps<{ videoId?: string; youtubeId?: string }>();

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

const show = props.videoId
	? await $fetch<Show>(
		`https://tv.directus.app/items/episodes/${props.videoId}?fields=vimeo_id,slug,season.show.slug,season.show.title`,
	)
	: null;
</script>

<template>
	<ClientOnly>
		<div
			v-if="youtubeId"
			class="aspect-video w-full overflow-hidden rounded-lg"
		>
			<iframe
				:src="`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3`"
				class="size-full"
				loading="lazy"
				referrerpolicy="strict-origin-when-cross-origin"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowfullscreen
			/>
		</div>
		<UCard
			v-else-if="show"
			class="w-full"
		>
			<ScriptVimeoPlayer
				:id="show.data.vimeo_id"
				:root-attrs="{ style: { width: '100%' } }"
				above-the-fold
			>
				<template #awaitingLoad>
					<div class="absolute inset-0 flex items-center justify-center">
						<UButton
							icon="i-lucide-circle-play"
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
					:href="`https://directus.com/tv/${show.data.season.show.slug}`"
					class="text-primary"
				>
					Watch {{ show.data.season.show.title }} on <LogoTv />
				</ULink>
			</template>
		</UCard>
	</ClientOnly>
</template>
