<script setup lang="ts">
const integrations = [
	{
		title: 'n8n',
		description: 'Automate workflows between Directus and other services using n8n\'s visual workflow builder.',
		to: '/guides/integrations/n8n',
		logo: '/docs/img/n8n.png',
	},
	{
		title: 'Clay',
		description: 'Connect Directus with Clay for data enrichment and automated workflows.',
		to: '/guides/integrations/clay',
		logo: '/docs/img/clay.png',
	},
	{
		title: 'Zapier',
		description: 'Automate workflows between Directus and thousands of other apps using Zapier.',
		to: '/guides/integrations/zapier',
		logo: '/docs/img/zapier.png',
	},
	{
		title: 'Vercel',
		description: 'Connect Directus with Vercel to trigger deployments and monitor build status.',
		to: '/guides/integrations/vercel',
		logo: '/docs/img/vercel.webp',
	},
	{
		title: 'Netlify',
		description: 'Integrate Directus with Netlify to deploy sites and track build progress.',
		to: '/guides/integrations/netlify',
		logo: '/docs/img/tutorials/netlify.png',
	},
];
</script>

<template>
	<div class="mt-8 gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
		<template
			v-for="integration in integrations"
			:key="integration.to"
		>
			<UPageCard
				:to="integration.to"
				class="hover:bg-primary/5 hover:ring-primary"
				:ui="{
					title: 'font-bold text-pretty',
					description: '',
					container: 'p-0',
				}"
			>
				<div class="min-w-0">
					<div
						class="relative p-5 rounded-t-lg bg-gradient-to-br from-primary/10 via-transparent to-primary/10"
					>
						<div class="pointer-events-none absolute inset-0 rounded-t-lg ring-1 ring-inset ring-gray-200/60 dark:ring-gray-700/60" />
						<div class="relative mx-auto flex h-22 w-22 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70">
							<img
								class="max-h-[70%] max-w-[70%] object-contain"
								:src="integration.logo"
								:alt="`${integration.title} logo`"
							>
						</div>
					</div>

					<div class="p-3">
						<!-- TODO: Remove Beta badge when Zapier integration is out of beta -->
						<div class="text-gray-900 dark:text-white text-base font-bold text-pretty flex items-center gap-2">
							<span class="truncate">{{ integration.title }}</span>
							<UBadge
								v-if="integration.title === 'Zapier'"
								variant="soft"
								color="info"
								size="sm"
								class="shrink-0"
							>
								Beta
							</UBadge>
						</div>
						<ProseP class="text-[15px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
							{{ integration.description }}
						</ProseP>
					</div>
				</div>
			</UPageCard>
		</template>
	</div>
</template>
