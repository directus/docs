<script setup lang="ts">
const { onLoaded } = useScript('https://js.hsforms.net/forms/embed/v2.js');

const { cta } = useAppConfig();
const { $posthog } = useNuxtApp();
const { newsletter } = cta;

function onFormSubmittedCallback(form: any, data: any) {
	$posthog?.capture('marketing.site.forms.hubspot.submit', {
		form_id: newsletter.form.hsForm,
		form_data: data,
	});
}

onMounted(() => {
	onLoaded(() => {
		// @ts-expect-error - HubSpot Forms is not typed
		hbspt.forms.create({
			region: 'na1',
			portalId: newsletter.form.hsPortal,
			formId: newsletter.form.hsForm,
			target: '#sidebar-nl-form',
			onFormSubmitted: onFormSubmittedCallback,
		});
	});
});
</script>

<template>
	<div class="text-center sm:text-left flex justify-between items-center bg-gradient-to-tr from-purple-500 to-pink-500 pl-4 pr-6 py-4 rounded-md gap-6 flex-col sm:flex-row">
		<p class="text-white font-bold text-lg block font-display text-balance leading-tight">
			{{ newsletter.description }}
		</p>
		<div
			id="sidebar-nl-form"
			class="my-2 w-full"
		/>
	</div>
</template>

<style>
@reference "@/assets/css/main.css";

#sidebar-nl-form form.hs-form {
	@apply flex gap-2 flex-col sm:flex-row w-full;
	.hs_email {
		.hs-error-msgs {
			@apply text-xs sm:text-sm text-inverted mt-2;
		}
		@apply flex-1;
		input[type=email] {
			@apply w-full min-w-48;
			@apply rounded-md text-xs sm:text-sm;
			@apply bg-default;
			@apply placeholder-gray-400 dark:placeholder-gray-500;
			@apply p-2;
		}
	}
	input[type=submit] {
		@apply rounded-md text-xs sm:text-sm font-bold w-full;
		@apply bg-inverted text-inverted;
		@apply py-2 px-4;
		@apply flex-none;
	}
}
</style>
