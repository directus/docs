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
	background-color: var(--background-subdued);
	z-index: 5;
	border-bottom: 1px solid var(--border);

	/* Border as an after so the active state indicator can sit on top*/
	&::after {
		content: '';
		position: absolute;
		inline-size: 100%;
		background-color: var(--border);
		block-size: 1px;
	}
}
</style>
