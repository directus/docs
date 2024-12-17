<script setup lang="ts">
const { cta } = useAppConfig();
</script>

<template>
	<NuxtLink
		to="https://directus.cloud"
		class="bg-gradient-to-r from-purple-500 to-pink-500 block pl-4 pr-6 py-4 rounded-md my-5 last:mb-0"
	>
		<LogoCloud class="h-8 w-auto" />
		<span class="text-white text-sm my-2 block">{{ cta.cloud.description }}</span>
		<UButton class="block" color="white">{{ cta.cloud.cta }}</UButton>
	</NuxtLink>
</template>
