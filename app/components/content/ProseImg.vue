<script setup lang="ts">
import { computed, useRuntimeConfig } from "#imports";
import { joinURL, withLeadingSlash, withTrailingSlash } from "ufo";

import ImageComponent from "#build/mdc-image-component.mjs";

const props = defineProps({
	src: {
		type: String,
		default: "",
	},
	alt: {
		type: String,
		default: "",
	},
	width: {
		type: [String, Number],
		default: undefined,
	},
	height: {
		type: [String, Number],
		default: undefined,
	},
});

const refinedSrc = computed(() => {
	if (props.src?.startsWith("/") && !props.src.startsWith("//")) {
		const _base = withLeadingSlash(
			withTrailingSlash(useRuntimeConfig().app.baseURL)
		);

		if (_base !== "/" && !props.src.startsWith(_base)) {
			return joinURL(_base, props.src);
		}
	}
	return props.src;
});
</script>

<template>
	<component
		:is="ImageComponent"
		:src="refinedSrc"
		:alt="props.alt"
		:width="props.width"
		:height="props.height"
		class="block rounded-md border border-gray-200 dark:border-gray-700"
	/>
</template>
