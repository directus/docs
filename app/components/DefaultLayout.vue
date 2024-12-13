<template>
	<div>
		<HeaderBanner />
		<HeaderHat>
			<slot name="mobile-nav" />
		</HeaderHat>
		<HeaderNav />
		<slot />
		<LayoutFooter />
	</div>
</template>
