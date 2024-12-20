<script setup lang="ts">
const { onLoaded } = useScript('https://js.hsforms.net/forms/embed/v2.js');

const { preFooter, footer, toc } = useAppConfig();
const route = useRoute();

onMounted(() => {
	onLoaded(() => {
		// @ts-expect-error - HubSpot Forms is not typed
		hbspt.forms.create({
			region: 'na1',
			portalId: toc.newsletter.hsPortal,
			formId: toc.newsletter.hsForm,
			target: '#nl-form',
		});
	});
});
</script>

<template>
	<div
		id="pre-footer"
		class="border-t border-gray-200 dark:border-gray-800 py-8 mt-14"
	>
		<div
			:class="route.path.startsWith('/api') ? 'max-screen' : 'max-w-7xl'"
			class="mx-auto grid md:grid-cols-3 gap-4 px-4 sm:px-6 lg:px-8 py-8 lg:py-4"
		>
			<div>
				<UPageLinks
					:links="preFooter.links"
					:ui="{ base: 'justify-start' }"
				/>
			</div>
			<div />
			<div class="text-sm">
				<ClientOnly>
					<h2 class="text-sm font-bold">
						Newsletter
					</h2>
					<div
						id="nl-form"
						class="my-2"
					/>
					<p class="text-xs italic">
						Get insights, releases, and updates delivered directly to your inbox once a month. Unsubscribe any time.
					</p>
				</ClientOnly>
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

<style lang="postcss">
#pre-footer form.hs-form {
	@apply flex gap-2;
	.hs_email {
		@apply flex-1;
		input[type=email] {
			@apply w-full;
			@apply rounded-md text-xs sm:text-sm;
			@apply placeholder-gray-400 dark:placeholder-gray-500;
			@apply border border-gray-200 dark:border-gray-800 p-2;
		}
	}
	input[type=submit] {
		@apply rounded-md text-xs sm:text-sm font-bold;
		@apply bg-purple-500 text-white;
		@apply border border-purple-200 dark:border-purple-800 py-2 px-4;
		@apply flex-none;
	}
	.hs-error-msg {

	}
}
</style>
