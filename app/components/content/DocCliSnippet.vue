<script setup lang="ts">
const props = defineProps<{
	command: string;
}>();

const isCopied = ref(false);

const commandParts = computed(() => {
	const firstSpaceIndex = props.command.indexOf(' ');
	if (firstSpaceIndex === -1) return { prefix: props.command, command: '' };
	return {
		prefix: props.command.slice(0, firstSpaceIndex + 1),
		command: props.command.slice(firstSpaceIndex + 1),
	};
});

const copyToClipboard = async () => {
	try {
		await navigator.clipboard.writeText(props.command);
		isCopied.value = true;

		setTimeout(() => {
			isCopied.value = false;
		}, 2000);
	}
	catch {
		// Silently fail if copy doesn't work
	}
};
</script>

<template>
	<div
		v-capture="{
			name: 'marketing.website.cli_snippet.copy.click',
			properties: {
				command: command,
			},
		}"
		class="flex items-center min-h-[46px] justify-between rounded-lg py-[9px] px-6 bg-inverted dark:bg-elevated border border-default transition-all duration-300 ease-out cursor-pointer hover:border-[#745eff] active:border-[#6644ff] dark:hover:border-pink-500 dark:active:border-purple-600"
		@click="copyToClipboard"
	>
		<div class="flex gap-2 font-mono text-sm font-medium leading-tight">
			<code class="not-prose text-pink-500 dark:text-pink-400 bg-transparent">{{ commandParts.prefix }}</code>
			<code class="not-prose text-inverted dark:text-highlighted bg-transparent">{{ commandParts.command }}</code>
		</div>
		<div class="text-inverted dark:text-highlighted text-sm font-medium text-right flex items-center gap-2">
			<template v-if="isCopied">
				<span>Copied!</span>
			</template>
			<UIcon
				class="w-5 h-5"
				name="i-lucide-copy"
			/>
		</div>
	</div>
</template>
