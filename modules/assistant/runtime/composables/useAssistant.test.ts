import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, defineComponent, h, nextTick, reactive } from 'vue';

const mockState = vi.hoisted(() => ({
	chats: [] as any[],
	transports: [] as any[],
	toastAdd: vi.fn(),
	messageId: 0,
	route: undefined as { path: string } | undefined,
}));

mockNuxtImport('useAppConfig', () => () => ({ assistant: { faqQuestions: [] } }));
mockNuxtImport('useRuntimeConfig', () => () => ({
	app: { baseURL: '/docs' },
	public: { assistant: { enabled: true, apiPath: '/__ai__/chat' } },
}));
mockNuxtImport('useRoute', () => () => mockState.route);
mockNuxtImport('useToast', () => () => ({ add: mockState.toastAdd }));

vi.mock('ai', () => ({
	DefaultChatTransport: class DefaultChatTransport {
		init: unknown;

		constructor(init: unknown) {
			this.init = init;
			mockState.transports.push(this);
		}
	},
}));

vi.mock('@ai-sdk/vue', async () => {
	const { ref } = await import('vue');

	return {
		Chat: class Chat {
			init: any;
			messagesRef: any;
			statusRef: any;
			sendMessage = vi.fn((message: { text: string }) => {
				this.messages = [...this.messages, {
					id: `user-${++mockState.messageId}`,
					role: 'user',
					parts: [{ type: 'text', text: message.text }],
				}];
			});
			stop = vi.fn(() => {
				this.status = 'ready';
			});
			regenerate = vi.fn();

			constructor(init: any) {
				this.init = init;
				this.messagesRef = ref(init.messages ?? []);
				this.statusRef = ref('ready');
				mockState.chats.push(this);
			}

			get messages() {
				return this.messagesRef.value;
			}

			set messages(value) {
				this.messagesRef.value = value;
			}

			get status() {
				return this.statusRef.value;
			}

			set status(value) {
				this.statusRef.value = value;
			}

			get lastMessage() {
				return this.messages.at(-1);
			}
		},
	};
});

async function flush() {
	await nextTick();
	await Promise.resolve();
	await nextTick();
}

function texts(messages: any[]) {
	return messages.flatMap(message =>
		message.parts?.flatMap((part: any) => part.type === 'text' ? [part.text] : []) ?? [],
	);
}

async function mountAssistant(initialPath = '/docs/guides/ai') {
	mockState.route = reactive({ path: initialPath });
	const { useAssistant } = await import('./useAssistant');
	let assistant: ReturnType<typeof useAssistant> | undefined;

	await mountSuspended(defineComponent({
		setup() {
			assistant = useAssistant();
			return () => h('div');
		},
	}));

	if (!assistant) throw new Error('assistant did not mount');
	return assistant;
}

describe('useAssistant', () => {
	beforeEach(async () => {
		vi.useRealTimers();
		vi.resetModules();
		localStorage.clear();
		mockState.chats.length = 0;
		mockState.transports.length = 0;
		mockState.toastAdd.mockReset();
		mockState.messageId = 0;
		mockState.route = undefined;
		const { clearNuxtState } = await import('#imports');
		clearNuxtState();
	});

	it('sends a pending initial message under a new conversation', async () => {
		const assistant = await mountAssistant();
		const chat = mockState.chats[0];

		assistant.open('How do I install Directus?', true);
		await flush();

		expect(assistant.isOpen.value).toBe(true);
		expect(chat.sendMessage).toHaveBeenCalledWith({ text: 'How do I install Directus?' });
		expect(assistant.activeConversationId.value).toBeTruthy();
		expect(texts(chat.messages)).toEqual(['How do I install Directus?']);
	});

	it('resets without allowing a stale easter egg timer to append', async () => {
		vi.useFakeTimers();
		const assistant = await mountAssistant();
		const chat = mockState.chats[0];

		assistant.submit('what\'s up doc');
		await flush();
		expect(chat.messages).toHaveLength(1);
		expect(assistant.easterEggLoadingId.value).toBeTruthy();

		assistant.resetChat();
		vi.advanceTimersByTime(2_000);
		await flush();

		expect(chat.stop).toHaveBeenCalled();
		expect(chat.messages).toHaveLength(0);
		expect(assistant.easterEggLoadingId.value).toBeNull();
	});

	it('stops the stream when deleting the active conversation', async () => {
		const assistant = await mountAssistant();
		const chat = mockState.chats[0];

		assistant.submit('Tell me about collections');
		await flush();
		const activeId = assistant.activeConversationId.value;
		expect(activeId).toBeTruthy();

		chat.status = 'streaming';
		assistant.deleteConversation(activeId!);
		await flush();

		expect(chat.stop).toHaveBeenCalled();
		expect(chat.messages).toHaveLength(0);
		expect(assistant.activeConversationId.value).toBeNull();
		expect(assistant.conversations.value.some(conv => conv.id === activeId)).toBe(false);
	});

	it('stops the current stream before opening another conversation', async () => {
		const assistant = await mountAssistant();
		const chat = mockState.chats[0];

		assistant.submit('First question');
		await flush();
		const firstId = assistant.activeConversationId.value!;
		assistant.resetChat();
		await flush();

		assistant.submit('Second question');
		await flush();
		expect(assistant.activeConversationId.value).not.toBe(firstId);

		chat.stop.mockClear();
		assistant.openConversation(firstId);
		await flush();

		expect(chat.stop).toHaveBeenCalled();
		expect(assistant.activeConversationId.value).toBe(firstId);
		expect(texts(chat.messages)).toEqual(['First question']);
	});

	it('reenables page context after route changes', async () => {
		const assistant = await mountAssistant('/docs/guides/ai/assistant');

		expect(assistant.currentPagePath.value).toBe('/guides/ai/assistant');
		expect(assistant.pageContextActive.value).toBe(true);

		assistant.dismissPageContext();
		expect(assistant.pageContextActive.value).toBe(false);

		mockState.route!.path = '/docs/guides/ai/mcp';
		await flush();

		expect(assistant.currentPagePath.value).toBe('/guides/ai/mcp');
		expect(assistant.pageContextActive.value).toBe(true);
	});
});
