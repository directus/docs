<script setup lang="ts">
import type { ContentCollectionItem } from '@nuxt/content';
import { useClipboard } from '@vueuse/core';

const props = defineProps<{
	page: ContentCollectionItem;
}>();

const isCopied = ref(false);

const items = [
	{
		label: 'Copy Page',
		description: 'Copy page as Markdown for LLMs',
		icon: 'material-symbols:content-copy-outline',
		onSelect: () => copyPage(),
	},
	{
		label: 'View as Markdown',
		description: 'View this page as plain text',
		icon: 'material-symbols:markdown-outline',
		onSelect: () => {
			navigateTo(`https://github.com/directus/docs/raw/refs/heads/main/content/${props.page?.stem}.md`, {
				open: {
					target: '_blank',
				},
			});
		},
	},
	{
		label: 'Open in ChatGPT',
		icon: 'i-simple-icons:openai',
		target: '_blank',
		onSelect() {
			navigateTo(`https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read ${window.location.href} so I can ask questions about it.`)}`, {
				open: {
					target: '_blank',
				},
			});
		},
	},
	{
		label: 'Open in Claude',
		icon: 'i-simple-icons:anthropic',
		target: '_blank',
		onSelect() {
			navigateTo(`https://claude.ai/new?q=${encodeURIComponent(`Read ${window.location.href} so I can ask questions about it.`)}`, {
				open: {
					target: '_blank',
				},
			});
		},
	},
];

async function copyPage() {
	try {
		const value = (props.page?.rawbody ?? '').replace(/\\n/g, '\n');
		await useClipboard().copy(value);
		isCopied.value = true;

		setTimeout(() => {
			isCopied.value = false;
		}, 2000);
	}
	catch {
		// Silently fail if copy doesn't work
	}
}
</script>

<template>
	<UButtonGroup>
		<UButton color="neutral" variant="outline" leading-icon="material-symbols:content-copy-outline"
			:label="isCopied ? 'Copied!' : 'Copy page'" @click="copyPage" />

		<UDropdownMenu :items="items" :content="{ side: 'bottom', align: 'end' }">
			<UButton color="neutral" variant="outline" icon="material-symbols:keyboard-arrow-down" />
			<template #item="{ item }">
				<div class="flex gap-2 text-left">
					<UIcon :name="item.icon" class="text-lg" />
					<div>
						<p>{{ item.label }}</p>
						<p class="text-xs text-muted">nullify
							{{ item.description }}
						</p>
					</div>
				</div>
			</template>
		</UDropdownMenu>
	</UButtonGroup>
</template>

<style scoped></style>
