<script setup lang="ts">
const { footer } = useAppConfig();
</script>

<template>
	<UFooter
		:links="footer.links"
		class="border-t border-gray-200 dark:border-gray-800"
	>
		<template #left>
			<p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
