<script setup lang="ts">
withDefaults(
	defineProps<{
		code?: string;
		language?: string | null;
		filename?: string | null;
		highlights?: number[];
		meta?: string | null;
		class?: string | null;
	}>(),
	{
		code: '',
		language: null,
		filename: null,
		highlights: () => [],
		meta: null,
		class: null,
	},
);
</script>

<template>
	<div class="prose-pre">
		<div
			v-if="filename"
			class="filename"
		>
			<Icon
				v-if="getFileIcon(filename)"
				:name="(getFileIcon(filename) as string)"
			/>
			{{ filename }}
		</div>
		<pre :class="$props.class"><slot /></pre>
	</div>
</template>

<style scoped lang="scss">
.filename {
	background: var(--background-subdued);
	border-top-left-radius: var(--border-radius);
	border-top-right-radius: var(--border-radius);
	padding: 0.5rem 1rem;
	font-family: var(--font--code);
	font-size: 0.8rem;
	border: 1px solid var(--border-subdued);
	border-bottom: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.filename + pre {
	border-top-left-radius: 0;
	border-top-right-radius: 0;
}
pre {
	width: 100%;
	font-weight: normal;
	padding: 0.7rem 1rem;
	border-radius: var(--border-radius);
	background: var(--background-subdued);
	border: 1px solid var(--border-subdued);
}
</style>

<style>
pre code .line {
	display: block;
	font-size: 0.9rem;
}
</style>
