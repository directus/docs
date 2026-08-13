<script setup lang="ts">
import UiProsePre from "@nuxt/ui/components/prose/Pre.vue";
import { computed } from "vue";

defineOptions({ name: "ProsePre", inheritAttrs: false });

const props = defineProps<{
	icon?: string;
	code?: string;
	language?: string;
	filename?: string;
	highlights?: number[];
	hideHeader?: boolean;
	meta?: string;
	class?: unknown;
}>();

const isTerminal = computed(() => props.language === "cli");

interface Span {
	text: string;
	class?: string;
}

// Mirrors the CLI's own painting (packages/cli/src/kernel/ui.ts): colored status
// glyphs, green + / yellow ~ plan tokens, whole-line red deletions with a red
// `✖N deleted` tail, and dimmed hint lines under an error.
const STATUS_GLYPHS: Record<string, string> = {
	"●": "text-cyan-400",
	"◇": "text-green-400",
	"▲": "text-yellow-400",
	"✖": "text-red-400",
};

function paint(line: string, inErrorHint: boolean): Span[] {
	if (inErrorHint) return [{ text: line, class: "text-neutral-500" }];
	if (line.startsWith("✖ DELETE"))
		return [{ text: line, class: "text-red-400" }];

	if (line.startsWith("+")) {
		return [{ text: "+", class: "text-green-400" }, { text: line.slice(1) }];
	}

	if (line.startsWith("~")) {
		const rest = line.slice(1);
		const tail = rest.indexOf("✖");

		if (tail !== -1 && !rest.slice(tail).startsWith("✖0 ")) {
			return [
				{ text: "~", class: "text-yellow-400" },
				{ text: rest.slice(0, tail) },
				{ text: rest.slice(tail), class: "text-red-400" },
			];
		}

		return [{ text: "~", class: "text-yellow-400" }, { text: rest }];
	}

	const glyphClass = STATUS_GLYPHS[line.charAt(0)];
	if (glyphClass && line.charAt(1) === " ")
		return [
			{ text: line.charAt(0), class: glyphClass },
			{ text: line.slice(1) },
		];

	return [{ text: line }];
}

const lines = computed<Span[][]>(() => {
	const raw = (props.code ?? "").replace(/\n$/, "").split("\n");
	const painted: Span[][] = [];
	let inErrorHint = false;

	for (const line of raw) {
		if (!line.startsWith("  "))
			inErrorHint = line.startsWith("✖ ") && !line.startsWith("✖ DELETE");
		painted.push(paint(line, inErrorHint && line.startsWith("  ")));
	}

	return painted;
});
</script>

<template>
	<div
		v-if="isTerminal"
		class="not-prose my-5 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 font-mono text-xs/5 text-neutral-200"
	>
		<div
			class="relative flex items-center justify-center border-b border-neutral-800 px-4 py-2.5"
		>
			<div class="absolute left-4 flex gap-1.5" aria-hidden="true">
				<span class="size-2.5 rounded-full bg-neutral-700" />
				<span class="size-2.5 rounded-full bg-neutral-700" />
				<span class="size-2.5 rounded-full bg-neutral-700" />
			</div>
			<span class="text-[11px] text-neutral-400">{{
				filename || "Terminal"
			}}</span>
		</div>
		<pre
			class="overflow-x-auto px-4 py-3.5"
			v-bind="$attrs"
		><code><template v-for="(line, index) in lines" :key="index"><span v-for="(span, spanIndex) in line" :key="spanIndex" :class="span.class">{{ span.text }}</span>{{ '\n' }}</template></code></pre>
	</div>
	<UiProsePre
		v-else
		:icon="icon"
		:code="code"
		:language="language"
		:filename="filename"
		:highlights="highlights"
		:hide-header="hideHeader"
		:meta="meta"
		:class="props.class"
		v-bind="$attrs"
	>
		<slot />
	</UiProsePre>
</template>
