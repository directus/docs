<script setup lang="ts">
export interface OgProps {
	title?: string;
	description?: string;
	breadcrumb?: string[];
}

defineOptions({
	inheritAttrs: false,
});

function truncate(str: string | undefined, n: number) {
	if (!str) return '';
	const isTooLong = str.length > n;
	const s = isTooLong ? str.substr(0, n - 1) : str;
	const i = s.lastIndexOf(' ');
	return isTooLong ? `${s.substr(0, i)}...` : s;
}

withDefaults(defineProps<OgProps>(), {
	title: 'Directus Docs',
});
</script>

<template>
	<div
		style="
			display: flex;
			position: relative;
			width: 100%;
			height: 100%;
			overflow: hidden;
			background-color: #000000;
			background-image: url('/docs/og-image.png');
			background-size: 1200px 600px;
			background-repeat: no-repeat;
			font-family: 'Source Serif 4';
			padding: 115px 75px 100px 75px;
		"
	>
		<div
			style="
				display: flex;
				flex-direction: column;
				justify-content: flex-end;
				height: 100%;
			"
		>
			<div
				v-if="breadcrumb && breadcrumb.length"
				style="display: flex; gap: 10px; margin-bottom: 20px"
			>
				<div
					style="
						color: rgba(255, 255, 255, 0.75);
						font-family: 'IBM Plex Mono';
						font-size: 28px;
						font-weight: 500;
						line-height: 100%;
					"
				>
					{{ breadcrumb.join(" > ").toUpperCase() }}
				</div>
			</div>
			<h1
				style="
					font-family: 'Source Serif 4';
					color: #fff;
					font-size: 84px;
					line-height: 84px;
					font-weight: 600;
					margin: 0;
				"
			>
				{{ truncate(title, 70) }}
			</h1>
			<p
				v-if="description"
				style="
					font-family: 'Source Serif 4';
					color: rgba(255, 255, 255, 0.75);
					font-size: 32px;
					line-height: 44px;
					font-weight: 400;
					margin-top: 24px;
				"
			>
				{{ truncate(description, 140) }}
			</p>
		</div>
	</div>
</template>
