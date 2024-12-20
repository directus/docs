<script setup lang="ts">
export interface OgProps {
	title: string;
	breadcrumb?: string[];
}

// inherited attrs can mess up the satori parser
defineOptions({
	inheritAttrs: false,
});

function truncate(str: string, n: number) {
	// Leave whole words intact
	const isTooLong = str.length > n;
	const s = isTooLong ? str.substr(0, n - 1) : str;
	const i = s.lastIndexOf(' ');
	return isTooLong ? `${s.substr(0, i)}...` : s;
}

defineProps<OgProps>();
</script>

<template>
	<div
		style="
			display: flex;
			position: relative;
			width: 100%;
			height: 100%;
			overflow: hidden;
			background-color: #ffffff;
			font-family: 'Poppins';
			padding: 115px 75px 100px 75px;
		"
	>
		<img
			src="/og-image-background.png"
			style="position: absolute; inset: 0px; object-fit: cover"
			width="1200"
			height="600"
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
				v-if="breadcrumb"
				style="display: flex; gap: 10px; margin-bottom: 20px"
			>
				<div
					style="
						color: rgba(255, 255, 255, 0.75);
						font-family: 'Fira Mono';
						font-size: 28px;
						font-style: normal;
						font-weight: 500;
						line-height: 100%;
					"
				>
					{{ breadcrumb.join(" > ").toUpperCase() }}
				</div>
			</div>
			<h1
				style="
					font-family: Poppins;
					color: #fff;
					font-size: 84;
					line-height: 84px;
					font-weight: 600;
				"
			>
				{{ truncate(title, 70) }}
			</h1>
		</div>
	</div>
</template>
