<script setup lang="ts">
interface Props {
	height?: number;
}

withDefaults(defineProps<Props>(), {
	height: 16,
});
</script>

<template>
	<div
		class="assistant-slashes inline-flex items-center gap-[4px] text-current"
		:style="{ height: `${height}px` }"
		aria-hidden="true"
	>
		<svg
			v-for="i in 2"
			:key="i"
			class="slash"
			:width="height / 6"
			:height="height"
			viewBox="0 0 2 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				class="seg seg-top"
				y="0"
				width="1"
				height="6"
				fill="currentColor"
			/>
			<rect
				class="seg seg-bot"
				y="6"
				width="1"
				height="6"
				fill="currentColor"
			/>
		</svg>
	</div>
</template>

<style scoped>
.assistant-slashes {
  --flip-duration: 0.7s;
}

.slash {
  display: block;
}

.seg {
  will-change: transform;
}

/* Start frame: top-left + bottom-right (x=0 top, x=1 bottom)
   End frame:   top-right + bottom-left (x=1 top, x=0 bottom) */
.seg-top {
  animation: flip-top var(--flip-duration) steps(1, end) infinite;
}
.seg-bot {
  animation: flip-bot var(--flip-duration) steps(1, end) infinite;
}

@keyframes flip-top {
  0%, 50% { transform: translateX(0); }
  50.01%, 100% { transform: translateX(1px); }
}
@keyframes flip-bot {
  0%, 50% { transform: translateX(1px); }
  50.01%, 100% { transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .seg-top,
  .seg-bot {
    animation: none;
  }
}
</style>
