<script setup lang="ts">
const integrations = [
	{
		title: 'n8n',
		description: 'Automate workflows between Directus and other services using n8n\'s visual workflow builder.',
		to: '/guides/integrations/n8n',
		logo: '/img/tutorials/n8n.png',
	},
	{
		title: 'Clay',
		description: 'Connect Directus with Clay for data enrichment and automated workflows.',
		to: '/guides/integrations/clay',
		logo: '/img/tutorials/clay.png',
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
					description: 'line-clamp-2',
					container: 'p-0',
				}"
			>
				<div class="min-w-0">
					<div
						class="relative p-6 rounded-t-lg bg-gradient-to-br from-primary/10 via-transparent to-primary/10"
					>
						<div class="pointer-events-none absolute inset-0 rounded-t-lg ring-1 ring-inset ring-gray-200/60 dark:ring-gray-700/60" />
						<img
							class="mx-auto h-28 sm:h-32 md:h-36 w-auto max-w-[90%] object-contain dark:brightness-90"
							:src="integration.logo"
							:alt="`${integration.title} logo`"
						>
					</div>

					<div class="p-4">
						<ProseP class="text-gray-900 dark:text-white text-base truncate font-bold text-pretty">
							{{ integration.title }}
						</ProseP>
						<ProseP class="text-[15px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
							{{ integration.description }}
						</ProseP>
					</div>
				</div>
			</UPageCard>
		</template>
	</div>
</template>

