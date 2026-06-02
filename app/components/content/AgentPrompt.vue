<script setup lang="ts">
import { computed, ref, useSlots, type VNode } from 'vue';
import { Comment, Fragment, Static, Text } from 'vue';
import { useClipboard } from '@vueuse/core';

const props = withDefaults(defineProps<{
	title?: string;
	description?: string;
	prompt?: string;
	icon?: string;
}>(), {
	icon: 'material-symbols:auto-awesome-outline',
});

const slots = useSlots();
const open = ref(false);
const { copy, copied } = useClipboard({ copiedDuring: 2000 });

function vnodesToText(nodes: unknown): string {
	if (nodes == null || typeof nodes === 'boolean') return '';
	if (typeof nodes === 'string' || typeof nodes === 'number') return String(nodes);
	if (Array.isArray(nodes)) return nodes.map(vnodesToText).join('');

	const node = nodes as VNode;
	if (node.type === Comment) return '';
	if (node.type === Text || node.type === Static) {
		return typeof node.children === 'string' ? node.children : '';
	}
	if (node.type === Fragment) return vnodesToText(node.children);

	if (Array.isArray(node.children)) return vnodesToText(node.children);
	if (node.children && typeof node.children === 'object' && 'default' in node.children) {
		const fn = (node.children as { default?: () => VNode[] }).default;
		if (typeof fn === 'function') return vnodesToText(fn());
	}
	if (typeof node.children === 'string') return node.children;
	return '';
}

const promptText = computed(() => {
	if (props.prompt) return props.prompt.trim();
	return vnodesToText(slots.default?.()).trim();
});

function copyPrompt() {
	copy(promptText.value);
}

function toggleOpen() {
	open.value = !open.value;
}
</script>

<template>
	<div class="my-5 last:mb-0">
		<div class="relative flex flex-wrap items-center gap-2 border border-muted bg-muted rounded-md px-4 py-3">
			<UIcon
				v-if="icon"
				:name="icon"
				class="size-4 shrink-0 text-highlighted"
			/>
			<div class="min-w-0">
				<p
					v-if="title"
					class="text-sm/6 text-default font-medium"
				>
					{{ title }}
				</p>
				<p
					v-if="description"
					class="text-sm/6 text-muted"
				>
					{{ description }}
				</p>
			</div>
			<UFieldGroup
				size="sm"
				class="ms-auto"
			>
				<UButton
					:icon="copied ? 'material-symbols:check' : 'material-symbols:content-copy-outline'"
					:label="copied ? 'Copied' : 'Copy prompt'"
					color="primary"
					@click="copyPrompt"
				/>
				<UButton
					:icon="open ? 'material-symbols:visibility-off-outline' : 'material-symbols:visibility-outline'"
					color="primary"
					square
					@click="toggleOpen"
				/>
			</UFieldGroup>
		</div>

		<UCard
			v-show="open"
			variant="subtle"
			class="mt-2"
			:ui="{ body: 'p-3 sm:p-3' }"
		>
			<pre class="max-h-96 overflow-auto text-xs whitespace-pre-wrap font-mono text-default">{{ promptText }}</pre>
		</UCard>
	</div>
</template>
