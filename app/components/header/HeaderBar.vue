<template>
	<div class="header-bar">
		<HeaderBanner />
		<HeaderHat>
			<slot name="mobile-nav" />
		</HeaderHat>
		<HeaderNav />
	</div>
</template>

<style scoped>
.header-bar {
	position: sticky;
	top: 0;
	background-color: var(--background);
	z-index: 5;
}
</style>
