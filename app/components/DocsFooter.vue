<script setup lang="ts">
const { footer } = useAppConfig();
const route = useRoute();
</script>

<template>
	<UFooter
		:links="footer.links"
		class="border-t border-gray-200 dark:border-gray-800"
		:ui="route.path.startsWith('/api') ? { bottom: { container: 'max-w-screen' } } : {}"
	>
		<template #left>
			<p class="text-sm text-gray-400 dark:text-gray-500">
				©2024 Monospace Inc
			</p>
		</template>

		<template #right>
			<UButton
				v-for="social in footer.socials"
				:key="social.icon"
				size="xs"
				:icon="social.icon"
				color="gray"
				variant="ghost"
				:to="social.to"
				target="_blank"
			/>
		</template>
	</UFooter>
</template>
