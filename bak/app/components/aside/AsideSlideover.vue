<script lang="ts" setup>
const isOpen = defineModel<boolean>();
</script>

<template>
	<div>
		<div
			class="slideover"
			:style="`transform: translateX(${isOpen ? '0' : '200%'})`"
		>
			<button
				class="slideover-toggle"
				@click="isOpen = !isOpen"
			>
				<Icon name="material-symbols:close" />
			</button>
			<div class="nav-scroll">
				<slot />
			</div>
		</div>
		<div
			class="background-overlay"
			:class="{ hidden: !isOpen }"
			@click="isOpen = false"
		/>
	</div>
</template>

<style scoped>
.slideover {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	background-color: var(--background);
	padding-left: 1.5rem;
	padding-bottom: 1rem;
	padding-top: 0.5rem;
	z-index: 1000;
	min-width: 75vw;
	transition: transform 0.3s ease;
}

.nav-scroll {
	overflow-y: auto;
	height: 100%;
	padding-right: 1rem;
	scrollbar-color: var(--border-subtle) var(--background);
}

.background-overlay {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background-color: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(5px);
	z-index: 999;
}

.hidden {
	display: none;
}

.slideover-toggle {
	background: none;
	border: none;
	color: color-mix(in hsl shorter hue, var(--white) 60%, var(--black) 40%);;
	font-size: 1.5rem;
	cursor: pointer;
	height: 40px;
	width: 40px;
	position: fixed;
	top: 0.25rem;
	right: 0.25rem;
}
</style>
