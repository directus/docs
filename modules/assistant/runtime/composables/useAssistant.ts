import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport, type ChatStatus, type UIMessage } from 'ai';
import { useAppConfig, useRoute, useRuntimeConfig, useState, useToast } from '#imports';
import { computed, watch, type Ref } from 'vue';
import type { FaqCategory } from '../types';
import { buildEasterEggMessages, EASTER_EGG_RESPONSE_DELAY_MS, isEasterEggPrompt } from '../utils/easter-egg';
import { compactMessagesForRequest } from '../utils/messages';
import { useAssistantHistory } from './useAssistantHistory';

let chat: Chat<UIMessage> | null = null;
let initialized = false;
let lifecycleVersion = 0;
let easterEggTimer: ReturnType<typeof setTimeout> | undefined;

function parseErrorMessage(error: Error): string {
	try {
		const parsed = JSON.parse(error.message);
		return parsed?.message || error.message;
	}
	catch {
		return error.message;
	}
}

function cancelEasterEgg(easterEggLoadingId: Ref<string | null>) {
	if (easterEggTimer) {
		clearTimeout(easterEggTimer);
		easterEggTimer = undefined;
	}
	easterEggLoadingId.value = null;
}

export function useAssistant() {
	const config = useRuntimeConfig();
	const appConfig = useAppConfig();
	const assistantConfig = appConfig.assistant as { faqQuestions?: FaqCategory[] } | undefined;
	const isEnabled = computed(() => Boolean(config.public.assistant?.enabled));
	const isOpen = useState('assistant-open', () => false);
	const pendingMessage = useState<string | undefined>('assistant-pending', () => undefined);
	const easterEggLoadingId = useState<string | null>('assistant-easter-egg-id', () => null);
	const pageContextDismissed = useState('assistant-page-context-dismissed', () => false);
	const history = useAssistantHistory();

	const route = useRoute();
	const baseURL = (config.app?.baseURL || '/').replace(/\/$/, '');
	const currentPagePath = computed(() => {
		const path = route?.path;
		if (!path || !path.startsWith('/')) return null;
		const stripped = baseURL && path.startsWith(baseURL) ? path.slice(baseURL.length) : path;
		if (!stripped || stripped === '/') return null;
		return stripped;
	});
	const pageContextActive = computed(() => !pageContextDismissed.value && currentPagePath.value !== null);

	const faqQuestions = computed<FaqCategory[]>(() => assistantConfig?.faqQuestions ?? []);

	function ensureConversationId() {
		return history.activeId.value ?? history.startNew(chat?.messages ?? []).id;
	}

	function bumpLifecycle() {
		lifecycleVersion++;
		cancelEasterEgg(easterEggLoadingId);
	}

	// The single writer of chat.messages. Every conversation transition
	// (reset, open, delete, easter egg) goes through here so the persistence
	// watcher reasons about one mutation idiom, not three.
	function setMessages(next: UIMessage[]) {
		if (!chat) return;
		chat.messages.splice(0, chat.messages.length, ...next);
	}

	if (import.meta.client && !chat) {
		const toast = useToast();
		chat = new Chat({
			messages: history.active.value?.messages ? [...history.active.value.messages] : [],
			transport: new DefaultChatTransport({
				api: `${baseURL}${config.public.assistant.apiPath}`,
				fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
					const response = await fetch(input, init);
					if (localStorage.getItem('assistantDebug') === '1' && response.headers.get('x-assistant-mode') === 'degraded') {
						toast.add({
							description: 'Assistant running in reduced-quality mode.',
							icon: 'i-lucide-info',
							color: 'warning',
						});
					}
					return response;
				},
				headers: (): Record<string, string> => {
					const headers: Record<string, string> = {
						'x-assistant-session-id': ensureConversationId(),
					};
					if (pageContextActive.value && currentPagePath.value) headers['x-page-path'] = currentPagePath.value;
					return headers;
				},
				prepareSendMessagesRequest: ({ body, id, messageId, messages, trigger }) => ({
					body: {
						...body,
						id,
						messageId,
						trigger,
						messages: compactMessagesForRequest(messages),
					},
				}),
			}),
			onError: (error: Error) => {
				toast.add({
					description: parseErrorMessage(error),
					icon: 'i-lucide-alert-circle',
					color: 'error',
					duration: 0,
				});
			},
		});
	}

	const messages = computed<UIMessage[]>(() => chat?.messages ?? []);
	const status = computed<ChatStatus>(() => chat?.status ?? 'ready');
	const lastMessage = computed(() => messages.value.at(-1));
	const showThinking = computed(() => {
		const last = lastMessage.value;
		if (!last || last.role !== 'assistant') return false;
		if (easterEggLoadingId.value && last.id === easterEggLoadingId.value) return true;
		return status.value === 'streaming' && !last.parts?.some(p => p.type === 'text');
	});

	if (import.meta.client && !initialized) {
		initialized = true;

		watch(() => chat!.messages, (current) => {
			if (current.length === 0) return;
			const id = history.activeId.value ?? history.startNew(current).id;
			history.update(id, current);
		}, { deep: true });

		watch(pendingMessage, (message) => {
			if (!message || !chat) return;
			chat.sendMessage({ text: message });
			pendingMessage.value = undefined;
		}, { immediate: true });

		watch(() => route?.path, () => {
			pageContextDismissed.value = false;
		});

		if (chat && chat.lastMessage?.role === 'user' && !pendingMessage.value) {
			chat.regenerate();
		}
	}

	function open(initialMessage?: string, clearPrevious = false) {
		if (clearPrevious && chat) resetChat();
		if (initialMessage) pendingMessage.value = initialMessage;
		isOpen.value = true;
	}

	function close() {
		isOpen.value = false;
	}

	function toggle() {
		isOpen.value = !isOpen.value;
	}

	function dismissPageContext() {
		pageContextDismissed.value = true;
	}

	function submit(text: string) {
		const trimmed = text.trim();
		if (!trimmed || !chat) return;
		if (isEasterEggPrompt(trimmed)) {
			triggerEasterEgg(trimmed);
			return;
		}
		chat.sendMessage({ text: trimmed });
	}

	function triggerEasterEgg(userText: string) {
		if (!chat) return;
		cancelEasterEgg(easterEggLoadingId);
		const version = lifecycleVersion;
		const { user, assistant, response } = buildEasterEggMessages(userText);
		easterEggLoadingId.value = assistant.id;
		setMessages([...chat.messages, user]);
		easterEggTimer = setTimeout(() => {
			if (!chat || version !== lifecycleVersion || easterEggLoadingId.value !== assistant.id) return;
			setMessages([...chat.messages, { ...assistant, parts: response }]);
			easterEggLoadingId.value = null;
			easterEggTimer = undefined;
		}, EASTER_EGG_RESPONSE_DELAY_MS);
	}

	function stop() {
		chat?.stop();
	}

	function regenerate() {
		chat?.regenerate();
	}

	function resetChat() {
		if (!chat) return;
		bumpLifecycle();
		chat.stop();
		setMessages([]);
		history.clearActive();
	}

	function openConversation(id: string) {
		const conv = history.conversations.value.find(c => c.id === id);
		if (!conv || !chat) return;
		bumpLifecycle();
		chat.stop();
		history.setActive(id);
		setMessages(conv.messages);
		isOpen.value = true;
	}

	function deleteConversation(id: string) {
		const wasActive = history.activeId.value === id;
		if (wasActive && chat) {
			bumpLifecycle();
			chat.stop();
			setMessages([]);
		}
		history.remove(id);
	}

	return {
		isEnabled,
		isOpen,
		messages,
		status,
		lastMessage,
		showThinking,
		easterEggLoadingId,
		faqQuestions,
		currentPagePath,
		pageContextActive,
		conversations: history.conversations,
		activeConversationId: history.activeId,
		open,
		close,
		toggle,
		submit,
		stop,
		regenerate,
		resetChat,
		openConversation,
		deleteConversation,
		dismissPageContext,
	};
}
