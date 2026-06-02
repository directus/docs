<script setup lang="ts">
import type { ContentCollectionItem } from '@nuxt/content';
import { useClipboard } from '@vueuse/core';
import { withBase } from 'ufo';
import {
	chatGptPromptUrl,
	claudePromptUrl,
	MCP_IDES,
	mcpDeeplinkPath,
	mcpServerUrl,
} from '~/utils/agent-deeplinks';

const props = defineProps<{
	page: ContentCollectionItem;
}>();

interface CopyMenuItem {
	label: string;
	icon: string;
	description?: string;
	external?: boolean;
	onSelect: () => void | Promise<void>;
}

const isCopied = ref(false);
const isMcpUrlCopied = ref(false);
const isMarkdownLinkCopied = ref(false);

const baseURL = useRuntimeConfig().app.baseURL;
const markdownUrl = computed(() => withBase(`${props.page?.path ?? ''}.md`, baseURL));
const { copy } = useClipboard();

function openExternal(url: string) {
	navigateTo(url, { open: { target: '_blank' } });
}

async function copyWithFlag(text: string, flag: Ref<boolean>) {
	try {
		await copy(text);
	}
	catch {
		try {
			await navigator.clipboard.writeText(text);
		}
		catch {
			return;
		}
	}
	flag.value = true;
	setTimeout(() => {
		flag.value = false;
	}, 2000);
}

async function copyPage() {
	let value: string;
	try {
		value = await $fetch<string>(markdownUrl.value, { responseType: 'text' });
	}
	catch {
		value = (props.page?.rawbody ?? '').replace(/\\n/g, '\n');
	}
	await copyWithFlag(value, isCopied);
}

const copyMarkdownLink = () => copyWithFlag(`${window.location.origin}${markdownUrl.value}`, isMarkdownLinkCopied);
const copyMcpUrl = () => copyWithFlag(mcpServerUrl(window.location.origin, baseURL), isMcpUrlCopied);

const items = computed<CopyMenuItem[][]>(() => [
	[
		{
			label: isMarkdownLinkCopied.value ? 'Copied Markdown link!' : 'Copy Markdown link',
			icon: 'material-symbols:link',
			onSelect: () => copyMarkdownLink(),
		},
		{
			label: 'View as Markdown',
			icon: 'material-symbols:markdown-outline',
			external: true,
			onSelect: () => openExternal(markdownUrl.value),
		},
		{
			label: 'Open in ChatGPT',
			icon: 'i-simple-icons:openai',
			external: true,
			onSelect: () => openExternal(chatGptPromptUrl(`Read ${window.location.href} so I can ask questions about it.`)),
		},
		{
			label: 'Open in Claude',
			icon: 'i-simple-icons:anthropic',
			external: true,
			onSelect: () => openExternal(claudePromptUrl(`Read ${window.location.href} so I can ask questions about it.`)),
		},
	],
	[
		{
			label: isMcpUrlCopied.value ? 'Copied MCP URL!' : 'Copy MCP server URL',
			description: 'Use with any MCP-compatible client',
			icon: 'material-symbols:link',
			onSelect: () => copyMcpUrl(),
		},
		...MCP_IDES.map(ide => ({
			label: ide.label,
			icon: ide.icon,
			external: true,
			onSelect: () => openExternal(mcpDeeplinkPath(baseURL, ide.id)),
		})),
	],
]);
</script>

<template>
	<UFieldGroup>
		<UButton
			color="neutral"
			size="sm"
			variant="soft"
			leading-icon="material-symbols:content-copy-outline"
			:label="isCopied ? 'Copied!' : 'Copy page'"
			@click="copyPage"
		/>

		<UDropdownMenu
			:items="items"
			:content="{ side: 'bottom', align: 'end' }"
		>
			<UButton
				size="sm"
				variant="soft"
				color="neutral"
				icon="material-symbols:keyboard-arrow-down"
			/>
			<template #item="{ item }">
				<div class="flex gap-2 text-left">
					<UIcon
						:name="item.icon"
						class="text-lg"
					/>
					<div>
						<p>
							{{ item.label }}<UIcon
								v-if="item.external"
								name="i-lucide-arrow-up-right"
								class="ml-0.5 size-3 text-muted align-text-top"
							/>
						</p>
						<p
							v-if="item.description"
							class="text-xs text-muted"
						>
							{{ item.description }}
						</p>
					</div>
				</div>
			</template>
		</UDropdownMenu>
	</UFieldGroup>
</template>

<style scoped></style>
