<script setup lang="ts">
import { motion } from 'motion-v';
import { strings } from '../strings';

interface ToolCall {
	toolCallId: string;
	toolName: string;
	args: Record<string, unknown>;
}

const props = defineProps<{
	text?: string;
	toolCalls?: ToolCall[];
	isLoading?: boolean;
}>();

const RABBIT_PHRASES = [
	'Hopping through the docs…',
	'Down the rabbit hole…',
	'Following white rabbits…',
	'Burrowing into the source…',
	'Foraging for answers…',
	'Sniffing out clues…',
	'Twitching whiskers…',
	'Consulting the warren…',
	'Nibbling on bytes…',
	'Thumping for signals…',
	'Pulling rabbits from hats…',
	'Chasing carrots…',
	'Multiplying like rabbits…',
	'Zigzagging across docs…',
	'Tuning the antennae…',
	'Decoding bunny telemetry…',
	'Asking the Cheshire cat…',
	'Splicing carrot DNA…',
	'Hare-raising research…',
	'Untangling the briar patch…',
];

function pickPhrase(exclude?: string) {
	if (RABBIT_PHRASES.length <= 1) return RABBIT_PHRASES[0] || '';
	let next = RABBIT_PHRASES[Math.floor(Math.random() * RABBIT_PHRASES.length)];
	let guard = 0;
	while (next === exclude && guard++ < 5) {
		next = RABBIT_PHRASES[Math.floor(Math.random() * RABBIT_PHRASES.length)];
	}
	return next!;
}

const currentPhrase = ref(pickPhrase());

const targetText = computed(() => {
	if (!props.isLoading) return strings.loadingFinished;
	return props.text || currentPhrase.value;
});
const displayedText = ref(targetText.value);

const chars = 'abcdefghijklmnopqrstuvwxyz';

function scrambleText(from: string, to: string) {
	const maxLength = Math.max(from.length, to.length);
	let frame = 0;
	const totalFrames = 15;

	const animate = () => {
		frame++;
		let result = '';

		for (let i = 0; i < maxLength; i++) {
			const progress = frame / totalFrames;
			const charProgress = progress * maxLength;

			if (i < charProgress - 2) {
				result += to[i] || '';
			}
			else if (i < charProgress) {
				result += chars[Math.floor(Math.random() * chars.length)];
			}
			else {
				result += from[i] || '';
			}
		}

		displayedText.value = result;

		if (frame < totalFrames) {
			requestAnimationFrame(animate);
		}
		else {
			displayedText.value = to;
		}
	};

	requestAnimationFrame(animate);
}

let textInterval: ReturnType<typeof setInterval> | null = null;

watch(targetText, (newText, oldText) => {
	if (newText !== oldText && newText && oldText) {
		scrambleText(oldText, newText);
	}
});

// Stop text rotation when loading finishes
watch(() => props.isLoading, (isLoading) => {
	if (!isLoading && textInterval) {
		clearInterval(textInterval);
		textInterval = null;
	}
});

function getToolLabel(toolName: string, args: Record<string, unknown>) {
	const path = (args?.path as string) || '';
	const query = (args?.query as string) || '';
	const repo = (args?.repo as string) || '';

	if (toolName === 'list-docs') return strings.toolListPages;
	if (toolName === 'get-doc') return `${strings.toolReadPage} ${path || '...'}`;
	if (toolName === 'search-docs') return `${strings.toolSearchDocs} "${query}"`;
	if (toolName === 'search-directus-code') return `${strings.toolSearchCode} "${query}"${repo ? ` in ${repo}` : ''}`;
	if (toolName === 'get-directus-file') return `${strings.toolReadFile} ${repo}/${path || '...'}`;
	if (toolName === 'get-directus-page') {
		const page = path.replace(/^https?:\/\//, '').replace(/^directus\.com/, '');
		return `${strings.toolReadWebPage} directus.com${page.startsWith('/') ? page : `/${page}`}`;
	}

	return toolName;
}

onMounted(() => {
	// Text rotation only when loading
	if (!props.text && props.isLoading) {
		textInterval = setInterval(() => {
			currentPhrase.value = pickPhrase(currentPhrase.value);
		}, 3500);
	}
});

onUnmounted(() => {
	if (textInterval) clearInterval(textInterval);
});
</script>

<template>
	<div class="flex flex-col gap-2">
		<!-- Main loader with animation and text -->
		<div class="flex items-center text-xs leading-none text-muted overflow-hidden">
			<motion.div
				v-if="isLoading"
				:initial="{ opacity: 1, width: 'auto' }"
				:exit="{ opacity: 0, width: 0 }"
				:transition="{ duration: 0.2 }"
				class="shrink-0 mr-2"
			>
				<AssistantSlashes />
			</motion.div>
			<motion.span
				:animate="{ x: 0 }"
				:transition="{ duration: 0.2 }"
				class="font-mono tracking-tight mb-px"
			>
				{{ displayedText }}
			</motion.span>
		</div>

		<!-- Tool calls displayed below -->
		<div
			v-if="toolCalls?.length"
			class="flex flex-col gap-1"
			:class="isLoading ? 'pl-[22px]' : 'pl-0'"
		>
			<motion.div
				v-for="tool in toolCalls"
				:key="`${tool.toolCallId}-${JSON.stringify(tool.args)}`"
				:initial="{ opacity: 0, x: -4 }"
				:animate="{ opacity: 1, x: 0 }"
				:transition="{ duration: 0.15 }"
				class="flex items-center gap-1.5"
			>
				<span class="size-1 rounded-full bg-current opacity-40" />
				<span class="text-[11px] text-dimmed truncate max-w-[200px]">
					{{ getToolLabel(tool.toolName, tool.args) }}
				</span>
			</motion.div>
		</div>
	</div>
</template>
