<script setup lang="ts">
interface Show {
	data: {
		vimeo_id: string;
		slug: string;
		season: {
			show: {
				slug: string;
				title: string;
			};
		};
	};
}

const props = defineProps<{
	type: string;
	id: string;
}>();

let show: Show | false = false;
if (props.type === 'directus-tv') {
	show = await $fetch(`https://tv.directus.app/items/episodes/${props.id}?fields=vimeo_id,slug,season.show.slug,season.show.title`);
}
</script>

<template>
	<div v-if="type === 'youtube'">
		<iframe
			:src="`https://www.youtube.com/embed/${id}`"
			title="YouTube video player"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		/>
	</div>

	<div
		v-if="type === 'directus-tv' && show"
		class="tv-frame"
	>
		<iframe
			:src="`https://player.vimeo.com/video/${show.data.vimeo_id}?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479`"
			frameborder="0"
			allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
		/>
		<a :href="`https://directus.io/tv/${show.data.season.show.slug}`">
			<span>Watch {{ show.data.season.show.title }} on</span>
			<img
				alt="Directus TV"
				src="~/assets/img/tv-logo.svg"
			>
		</a>
	</div>
</template>

<style>
iframe {
	width: 100%;
	aspect-ratio: 16 / 9;
	border-radius: var(--border-radius);
}

.tv-frame {
	background-color: #0F172A;
	padding: 8px;
	border-radius: var(--border-radius);
}

.tv-frame iframe {
	border-radius: calc(var(--border-radius) / 2);
}

.tv-frame a {
	color: white;
	text-decoration: none;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 0.5rem;
	padding-right: 0.25rem;
	font-weight: bold;
}

.tv-frame a img {
	height: 1.5rem;
	margin-bottom: 0;
	width: auto;
}
</style>
