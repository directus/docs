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
		class="border-t border-default py-8 mt-14"
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
	<footer class="border-t border-default">
		<UContainer class="py-8 lg:py-4 lg:flex lg:items-center lg:justify-between lg:gap-x-3">
			<div class="lg:flex-1 lg:order-3 flex items-center justify-center lg:justify-end gap-x-1.5">
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
			</div>

			<div class="lg:order-2 mt-3 lg:mt-0 flex items-center justify-center">
				<UNavigationMenu
					:items="footer.links"
					variant="link"
				/>
			</div>

			<div class="lg:flex-1 lg:order-1 mt-3 lg:mt-0 flex items-center justify-center lg:justify-start gap-x-1.5">
				<p class="text-sm text-muted">
					© {{ new Date().getFullYear() }} Monospace Inc
				</p>
			</div>
		</UContainer>
	</footer>
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
			@apply bg-default text-default;
			@apply placeholder:text-muted;
			@apply border border-default p-2;
		}
	}
	input[type=submit] {
		@apply rounded-md text-xs sm:text-sm font-bold;
		@apply bg-primary text-inverted;
		@apply border border-primary py-2 px-4;
		@apply flex-none;
	}
}
</style>
