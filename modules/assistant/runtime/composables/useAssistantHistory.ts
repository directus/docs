import type { UIMessage } from 'ai';
import { useStorage } from '@vueuse/core';
import { computed } from 'vue';

export interface AssistantConversation {
	id: string;
	title: string;
	createdAt: number;
	updatedAt: number;
	messages: UIMessage[];
}

const STORAGE_KEY = 'directus-docs-assistant-conversations';
const ACTIVE_KEY = 'directus-docs-assistant-active';
const MAX_CONVERSATIONS = 50;
const STORED_MESSAGE_LIMIT = 40;

function newId() {
	return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(messages: UIMessage[]): string {
	const firstUser = messages.find(m => m.role === 'user');
	if (!firstUser) return 'New chat';
	const text = firstUser.parts
		?.flatMap(p => (p.type === 'text' ? [p.text] : []))
		.join(' ')
		.trim() ?? '';
	return text.length > 60 ? `${text.slice(0, 57)}…` : text || 'New chat';
}

function compactForStorage(messages: UIMessage[]): UIMessage[] {
	return messages.slice(-STORED_MESSAGE_LIMIT).map(message => ({
		...message,
		parts: message.parts?.filter(part => part.type === 'text' || part.type === 'data-tool-calls') ?? [],
	}));
}

export function useAssistantHistory() {
	const conversations = useStorage<AssistantConversation[]>(STORAGE_KEY, []);
	const activeId = useStorage<string | null>(ACTIVE_KEY, null);

	const sorted = computed(() =>
		[...conversations.value].sort((a, b) => b.updatedAt - a.updatedAt),
	);

	const active = computed(() =>
		conversations.value.find(c => c.id === activeId.value) ?? null,
	);

	function startNew(initial?: UIMessage[]): AssistantConversation {
		const now = Date.now();
		const messages = compactForStorage(initial ?? []);
		const conv: AssistantConversation = {
			id: newId(),
			title: deriveTitle(messages),
			createdAt: now,
			updatedAt: now,
			messages,
		};
		conversations.value = [conv, ...conversations.value].slice(0, MAX_CONVERSATIONS);
		activeId.value = conv.id;
		return conv;
	}

	function setActive(id: string) {
		if (conversations.value.some(c => c.id === id)) {
			activeId.value = id;
		}
	}

	function update(id: string, messages: UIMessage[]) {
		const idx = conversations.value.findIndex(c => c.id === id);
		if (idx === -1) return;
		const existing = conversations.value[idx]!;
		const compacted = compactForStorage(messages);
		const next: AssistantConversation = {
			...existing,
			messages: compacted,
			title: existing.title === 'New chat' ? deriveTitle(compacted) : existing.title,
			updatedAt: Date.now(),
		};
		const copy = [...conversations.value];
		copy[idx] = next;
		conversations.value = copy;
	}

	function remove(id: string) {
		conversations.value = conversations.value.filter(c => c.id !== id);
		if (activeId.value === id) activeId.value = null;
	}

	return {
		conversations: sorted,
		activeId,
		active,
		startNew,
		setActive,
		update,
		remove,
	};
}
