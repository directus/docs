<script setup lang="ts">
import { defineAsyncComponent, defineComponent, h } from 'vue';
import type { UIMessage } from 'ai';
import { useScrollShadow } from '@nuxt/ui/composables';
import { strings } from '../strings';
import { getMessageToolCalls } from '../utils/messages';

const LINK_CLASS = 'text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary break-words';

const SmartLink = defineComponent({
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		return () => {
			const href = typeof attrs.href === 'string' ? attrs.href : '';
			const isExternal = /^(https?:)?\/\//.test(href) && !href.startsWith(window.location.origin);
			const extra = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
			const merged = [LINK_CLASS, attrs.class as string | undefined].filter(Boolean).join(' ');
			return h('a', { ...attrs, ...extra, class: merged }, slots.default?.());
		};
	},
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const components: Record<string, any> = {
	'pre': defineAsyncComponent(() => import('./AssistantPreStream.vue')),
	'a': SmartLink,
	'video-embed': defineAsyncComponent(() => import('~/components/content/VideoEmbed.vue')),
};

const {
	messages,
	status,
	lastMessage,
	showThinking,
	easterEggLoadingId,
	faqQuestions,
	conversations,
	activeConversationId,
	currentPagePath,
	pageContextActive,
	close,
	submit,
	stop,
	regenerate,
	resetChat,
	openConversation,
	deleteConversation,
	dismissPageContext,
} = useAssistant();

const config = useRuntimeConfig();
const assistantSurveyId = config.public.assistant.feedbackSurveyId || '';
const input = ref('');
const viewMode = ref<'chat' | 'history'>('chat');
const chatScrollEl = useTemplateRef<HTMLElement>('chatScrollEl');
const chatPromptRef = ref<{ textareaRef?: HTMLTextAreaElement } | null>(null);
const { style: chatShadowStyle, arrivedState: chatArrivedState, isOverflowing: chatIsOverflowing } = useScrollShadow(chatScrollEl);
const showAutoScroll = computed(() => messages.value.length > 0 && chatIsOverflowing.value && !chatArrivedState.bottom);

function scrollToBottom() {
	const el = chatScrollEl.value;
	if (!el) return;
	el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}

function focusInput() {
	nextTick(() => {
		chatPromptRef.value?.textareaRef?.focus();
	});
}

function handleSubmit(event?: Event) {
	event?.preventDefault();
	const text = input.value;
	if (!text.trim()) return;
	input.value = '';
	submit(text);
}

function onReset() {
	resetChat();
	viewMode.value = 'chat';
	focusInput();
}

function onOpenConversation(id: string) {
	openConversation(id);
	viewMode.value = 'chat';
}

function getConversationSnippet(messages: UIMessage[]): string {
	const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
	const target = lastAssistant ?? messages[0];
	if (!target) return '';
	const text = target.parts
		?.flatMap(p => (p.type === 'text' ? [p.text] : []))
		.join(' ')
		.trim() ?? '';
	return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

function relativeTime(ts: number): string {
	const diff = Date.now() - ts;
	const min = 60_000;
	const hour = 60 * min;
	const day = 24 * hour;
	if (diff < min) return 'just now';
	if (diff < hour) return `${Math.floor(diff / min)}m ago`;
	if (diff < day) return `${Math.floor(diff / hour)}h ago`;
	if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
	return new Date(ts).toLocaleDateString();
}
</script>

<template>
	<div class="flex h-full flex-col bg-default">
		<div class="flex h-16 shrink-0 items-center justify-between border-b border-default px-4">
			<span class="font-medium text-highlighted">{{ strings.title }}</span>
			<div class="flex items-center gap-1">
				<UTooltip text="New chat">
					<UButton
						icon="i-lucide-plus"
						color="neutral"
						variant="ghost"
						size="sm"
						class="rounded-md text-muted hover:text-highlighted"
						@click="onReset"
					/>
				</UTooltip>
				<UTooltip :text="viewMode === 'history' ? 'Back to chat' : 'Chat history'">
					<UButton
						:icon="viewMode === 'history' ? 'i-lucide-arrow-left' : 'i-lucide-history'"
						color="neutral"
						variant="ghost"
						size="sm"
						class="rounded-md text-muted hover:text-highlighted"
						@click="viewMode = viewMode === 'history' ? 'chat' : 'history'"
					/>
				</UTooltip>
				<UTooltip :text="strings.close">
					<UButton
						icon="i-lucide-x"
						color="neutral"
						variant="ghost"
						size="sm"
						class="rounded-md text-muted hover:text-highlighted"
						@click="close"
					/>
				</UTooltip>
			</div>
		</div>
		<div
			v-if="viewMode === 'history'"
			ref="chatScrollEl"
			class="min-h-0 flex-1 overflow-y-auto"
			:style="chatShadowStyle"
		>
			<div
				v-if="conversations.length === 0"
				class="flex h-full flex-col items-center justify-center p-8 text-center"
			>
				<UIcon
					name="i-lucide-history"
					class="mb-3 size-8 text-muted"
				/>
				<p class="text-sm text-muted">
					No previous chats yet. Your conversations save automatically.
				</p>
			</div>
			<ul
				v-else
				class="flex flex-col divide-y divide-default"
			>
				<li
					v-for="conv in conversations"
					:key="conv.id"
					class="relative"
				>
					<button
						type="button"
						class="w-full px-4 py-3 pr-10 text-left transition hover:bg-elevated"
						:class="conv.id === activeConversationId ? 'bg-elevated/60' : ''"
						@click="onOpenConversation(conv.id)"
					>
						<div class="flex items-start justify-between gap-2">
							<p class="flex-1 truncate text-sm font-medium text-highlighted">
								{{ conv.title }}
							</p>
							<span class="shrink-0 text-xs text-dimmed">
								{{ relativeTime(conv.updatedAt) }}
							</span>
						</div>
						<p class="mt-1 line-clamp-2 text-xs text-muted">
							{{ getConversationSnippet(conv.messages) }}
						</p>
					</button>
					<UButton
						icon="i-lucide-trash-2"
						color="neutral"
						variant="ghost"
						size="sm"
						class="absolute right-2 top-2 rounded-md text-muted hover:text-highlighted"
						@click.stop="deleteConversation(conv.id)"
					/>
				</li>
			</ul>
		</div>
		<div
			v-else
			class="relative min-h-0 flex-1 flex flex-col"
		>
			<div
				ref="chatScrollEl"
				class="flex-1 overflow-y-auto"
				:style="chatShadowStyle"
			>
				<UChatMessages
					v-if="messages.length > 0"
					:messages="messages"
					compact
					:status="status"
					:auto-scroll="false"
					:user="{ ui: { content: 'text-sm' } }"
					:assistant="{ ui: { actions: 'static! mt-2 flex w-full [@media(hover:hover)]:opacity-0 group-hover/message:opacity-100 transition-opacity', container: 'flex-col items-stretch pb-3' } }"
					:ui="{ indicator: '*:bg-accented', root: 'h-auto!' }"
					class="px-4 py-4"
				>
					<template #content="{ message }">
						<div class="flex flex-col gap-2">
							<AssistantLoading
								v-if="message.role === 'assistant' && (getMessageToolCalls(message).length > 0 || (showThinking && message.id === lastMessage?.id))"
								:tool-calls="getMessageToolCalls(message)"
								:is-loading="showThinking && message.id === lastMessage?.id"
							/>
							<template
								v-for="(part, index) in message.parts"
								:key="`${message.id}-${part.type}-${index}${'state' in part ? `-${part.state}` : ''}`"
							>
								<MDCCached
									v-if="part.type === 'text' && part.text"
									:value="part.text"
									:cache-key="`${message.id}-${index}`"
									:components="components"
									:parser-options="{ highlight: false }"
									class="text-sm *:first:mt-0 *:last:mb-0 [&_a]:break-all [&_pre]:overflow-x-auto [&_code]:break-all"
								/>
							</template>
						</div>
					</template>
					<template #actions="{ message }">
						<AssistantMessageFeedback
							v-if="message.role === 'assistant' && (status !== 'streaming' || message.id !== lastMessage?.id)"
							:message="message"
							:survey-id="assistantSurveyId"
						/>
					</template>
				</UChatMessages>
				<div
					v-if="messages.length > 0 && easterEggLoadingId"
					class="px-4 pb-4"
				>
					<AssistantLoading :is-loading="true" />
				</div>
				<div
					v-if="messages.length === 0"
					class="p-4"
				>
					<div
						v-if="!faqQuestions?.length"
						class="flex h-full flex-col items-center justify-center py-12 text-center"
					>
						<div class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
							<UIcon
								name="i-lucide-message-circle-question"
								class="size-6 text-primary"
							/>
						</div>
						<h3 class="mb-2 text-base font-medium text-highlighted">
							{{ strings.askMeAnything }}
						</h3>
						<p class="max-w-xs text-sm text-muted">
							{{ strings.askMeAnythingDescription }}
						</p>
					</div>
					<template v-else>
						<div class="flex flex-col gap-5">
							<div
								v-for="category in faqQuestions"
								:key="category.category"
								class="flex flex-col gap-1.5"
							>
								<h4 class="text-xs font-medium font-mono uppercase tracking-wide text-dimmed">
									{{ category.category }}
								</h4>
								<div class="flex flex-col">
									<button
										v-for="question in category.items"
										:key="question"
										class="py-1.5 text-left text-sm text-muted transition-colors hover:text-highlighted"
										@click="submit(question)"
									>
										{{ question }}
									</button>
								</div>
							</div>
						</div>
					</template>
				</div>
			</div>
			<Transition
				enter-active-class="transition duration-150 ease-out"
				enter-from-class="opacity-0 translate-y-1"
				enter-to-class="opacity-100 translate-y-0"
				leave-active-class="transition duration-100 ease-in"
				leave-from-class="opacity-100 translate-y-0"
				leave-to-class="opacity-0 translate-y-1"
			>
				<UButton
					v-if="showAutoScroll"
					icon="i-lucide-arrow-down"
					color="neutral"
					variant="outline"
					size="sm"
					class="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 rounded-full shadow-lg"
					aria-label="Scroll to bottom"
					@click="scrollToBottom"
				/>
			</Transition>
		</div>
		<div
			v-if="viewMode === 'chat'"
			class="w-full shrink-0 p-3"
		>
			<div
				v-if="pageContextActive"
				class="mb-2 flex items-center gap-1.5 rounded-md border border-default bg-elevated/40 px-2 py-1 text-xs text-muted"
			>
				<UIcon
					name="i-lucide-file-text"
					class="size-3.5 shrink-0"
				/>
				<span class="truncate">Using context from <span class="font-mono text-default">{{ currentPagePath }}</span></span>
				<UButton
					icon="i-lucide-x"
					color="neutral"
					variant="ghost"
					size="xs"
					class="ml-auto -my-1"
					aria-label="Stop using page context"
					@click="dismissPageContext"
				/>
			</div>
			<UChatPrompt
				ref="chatPromptRef"
				v-model="input"
				:rows="2"
				:maxrows="8"
				:autoresize-delay="220"
				:autofocus-delay="220"
				:placeholder="strings.placeholder"
				maxlength="1000"
				:ui="{
					root: 'shadow-none! shrink-0 flex-none focus-within:ring-2 focus-within:ring-primary',
					body: 'rounded-none! text-base! max-h-48 h-auto ring-0! focus-within:ring-0!',
				}"
				@submit="handleSubmit"
			>
				<template #footer>
					<div class="flex items-center gap-1 text-xs text-muted">
						<span>{{ strings.lineBreak }}</span>
						<UKbd
							size="sm"
							value="shift"
						/>
						<UKbd
							size="sm"
							value="enter"
						/>
					</div>
					<UChatPromptSubmit
						class="ml-auto"
						size="xs"
						:status="status"
						@stop="stop"
						@reload="regenerate"
					/>
				</template>
			</UChatPrompt>
			<div class="mt-1 flex text-xs text-dimmed items-center justify-between gap-3">
				<span>{{ strings.assistantFooterNotice }}</span>
				<span class="shrink-0">
					{{ input.length }}/1000
				</span>
			</div>
		</div>
	</div>
</template>
