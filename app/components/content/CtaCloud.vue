<script setup lang="ts">
const { cta } = useAppConfig();
</script>

<template>
	<NuxtLink
		to="https://directus.cloud"
		class="flex justify-between items-center bg-gradient-to-tr from-purple-500 to-pink-500 pl-4 pr-6 py-4 rounded-md my-5 last:mb-0"
	>
		<span>
			<LogoCloud class="h-8 w-auto" />
			<span class="text-white text-sm mt-2 block">{{ cta.cloud.description }}</span>
		</span>
		<UButton
			class="block shrink-0 bg-default text-default hover:bg-default/80"
			size="lg"
		>{{ cta.cloud.cta }}</UButton>
	</NuxtLink>
</template>
