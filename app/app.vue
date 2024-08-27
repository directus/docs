<script setup lang="ts">
import { ConfigProvider } from 'radix-vue';

const site = useSiteConfig();

// Base HTML Head Configuration
useHead({
	meta: [
		{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
	],
	link: [
		{ rel: 'icon', href: '/favicon.ico' },
	],
	htmlAttrs: {
		lang: 'en',
	},
});

// Base SEO Configuration
useSeoMeta({
	titleTemplate: `%s - ${site.name}`,
	ogSiteName: site.name,
	twitterCard: 'summary_large_image',
});

const useIdFunction = () => useId();
</script>

<template>
	<ConfigProvider :use-id="useIdFunction">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</ConfigProvider>
</template>
