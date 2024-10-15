<template>
	<div>
		<HeaderBanner />
		<HeaderHat>
			<slot name="mobile-nav" />
		</HeaderHat>
		<HeaderNav />
		<slot />
	</div>
</template>
