<script setup lang="ts">
const { preFooter, footer } = useAppConfig();
const route = useRoute();
</script>

<template>
	<div
		id="pre-footer"
		class="border-t border-gray-200 dark:border-gray-800"
	>
		<div
			:class="route.path.startsWith('/api') ? 'max-screen' : 'max-w-7xl'"
			class="mx-auto grid md:grid-cols-3 gap-4 px-4 sm:px-6 lg:px-8 py-8 lg:py-4"
		>
			<div class="col-span-2">
				<UPageLinks :links="preFooter.links" />
			</div>
			<div class="">
				<UFormGroup
					label="Sign up for developer updates"
					help="You can unsubscribe at any point."
				>
					<UButtonGroup orientation="horizontal">
						<UInput icon="i-heroicons-envelope" />
						<UButton color="gray">
							Sign up
						</UButton>
					</UButtonGroup>
				</UFormGroup>
			</div>
		</div>
	</div>
	<UFooter
		:links="footer.links"
		class="border-t border-gray-200 dark:border-gray-800"
		:ui="route.path.startsWith('/api') ? { bottom: { container: 'max-w-screen' } } : {}"
	>
		<template #left>
			<p class="text-sm text-gray-400 dark:text-gray-500">
				© {{ new Date().getFullYear() }} Monospace Inc
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
