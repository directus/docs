<script setup lang="ts">
useScript('https://js.hsforms.net/forms/embed/v2.js');

const { toc } = useAppConfig();

onMounted(() => {
	// @ts-expect-error - HubSpot Forms is not typed
	hbspt.forms.create({
		region: 'na1',
		portalId: toc.newsletter.hsPortal,
		formId: toc.newsletter.hsForm,
		target: '#nl-form',
	});
});
</script>

<template>
	<div>
		<p class="font-semibold text-sm/6 truncate">
			Newsletter
		</p>
		<p class="font-semibold text-sm/6 truncate">
			Get insights, releases, and updates delivered directly to your inbox once a month.
		</p>
		<ClientOnly>
			<div id="nl-form" />
		</ClientOnly>
	</div>
</template>
