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
	<ClientOnly>
		<div
			v-capture="{
				name: 'marketing.website.cli_snippet.copy.click',
				properties: {
					command: command,
				},
			}"
			class="flex items-center min-h-[46px] justify-between rounded-lg py-[9px] px-6 bg-[#172940] dark:bg-gray-800 border border-transparent shadow-[0px_0px_10px_2px_#6644ff33] transition-all duration-300 ease-out cursor-pointer hover:shadow-[0px_0px_10px_2px_#6644ff33,0px_0px_10px_1px_#ffade44d] hover:border-[#745eff] active:border-[#6644ff] dark:border-gray-700 dark:shadow-[0px_0px_10px_2px_#ff69b433]  dark:hover:border-pink-500 dark:active:border-purple-600"
			@click="copyToClipboard"
		>
			<div class="flex gap-2 font-mono text-sm font-medium leading-tight">
				<code class="not-prose text-[#ff69b4] bg-transparent dark:text-pink-400">{{ commandParts.prefix }}</code>
				<code class="not-prose text-white bg-transparent dark:text-gray-200">{{ commandParts.command }}</code>
			</div>
			<div class="text-white text-sm font-medium text-right flex items-center gap-2 dark:text-gray-200">
				<template v-if="isCopied">
					<span>Copied!</span>
				</template>
				<UIcon
					class="w-5 h-5"
					name="material-symbols:content-copy-outline"
				/>
			</div>
		</div>
	</ClientOnly>
</template>
