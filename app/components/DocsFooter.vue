<script setup lang="ts">
const { onLoaded } = useScript('https://js.hsforms.net/forms/embed/v2.js');

const { preFooter, footer, toc } = useAppConfig();

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
			class="mx-auto grid md:grid-cols-3 gap-4 px-4 sm:px-6 lg:px-8 py-8 lg:py-4 max-w-7xl"
		>
			<div>
				<LogoDocs class="w-auto h-8 shrink-0" />
				<UPageAnchors
					:links="preFooter.links"
					class="mt-4"
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
		class="border-t border-default"
	>
		<template #left>
			<p class="text-sm text-gray-400 dark:text-gray-500">
				© {{ new Date().getFullYear() }} Monospace Inc
			</p>
		</template>

		<UNavigationMenu
			:items="footer.links"
			variant="link"
		/>

		<template #right>
			<UButton
				v-for="social in footer.socials"
				:key="social.icon"
				size="xs"
				:icon="social.icon"
				color="neutral"
				variant="ghost"
				:to="social.to"
				target="_blank"
			/>
		</template>
	</UFooter>
</template>

<style>
@reference "@/assets/css/main.css";

#pre-footer form.hs-form {
	@apply flex gap-2;
	.hs_email {
		@apply flex-1;
		input[type=email] {
			@apply w-full;
			@apply rounded-md text-xs sm:text-sm;
			@apply dark:bg-gray-900;
			@apply placeholder-gray-400 dark:placeholder-gray-500;
			@apply border border-gray-200 dark:border-gray-800 p-2;
		}
	}
	input[type=submit] {
		@apply rounded-md text-xs sm:text-sm font-bold;
		@apply bg-primary-500 text-white;
		@apply border border-primary-200 dark:border-primary-800 py-2 px-4;
		@apply flex-none;
	}
}
</style>
