<script setup lang="ts">
const route = useRoute();
</script>

<template>
	<div>
		<HeaderBanner />
		<HeaderHero v-if="route.path === '/' || route.path === '/getting-started/overview'" />
		<HeaderHat v-else>
			<slot name="mobile-nav" />
		</HeaderHat>
		<HeaderNav />
		<slot />
	</div>
</template>
