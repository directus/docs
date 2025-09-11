<script setup lang="ts">
interface ChatToolInvocation {
	toolCallId: string;
	toolName: string;
	state: 'call' | 'result';
	args?: Record<string, any>;
	result?: string;
}

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	toolInvocations?: ChatToolInvocation[];
	id?: string;
}

interface ChatProps {
	messages: ChatMessage[];
	chatId?: string;
}

const props = defineProps<ChatProps>();

// Generate stable message IDs based on chatId and content
const messages = computed(() => {
	return props.messages.map((message, index) => ({
		...message,
		id: message.id || `${props.chatId || 'chat'}-${message.role}-${index}`,
	}));
});
</script>

<template>
	<div class="border border-accented rounded-lg p-4">
		<UChatMessages
			:messages="messages as any"
			:user="{
				side: 'right',
				variant: 'subtle',
				avatar: {
					icon: 'material-symbols:person',
				},
			}"
			:assistant="{
				side: 'left',
				avatar: {
					icon: 'material-symbols:smart-toy',
				},

			}"
		>
			<template #content="{ message }">
				<MDC
					:value="message.content"
					:cache-key="message.id"
					unwrap="p"
				/>

				<!-- Tool calls display -->
				<div
					v-if="message?.toolInvocations && message?.toolInvocations.length"
					class="mt-3 space-y-2"
				>
					<div
						v-for="tool in message.toolInvocations"
						:key="tool.toolCallId"
						class="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-muted border border-muted"
					>
						<UIcon
							name="material-symbols:check-circle"
							class="w-4 h-4 flex-shrink-0 text-muted"
						/>
						<span
							class="font-medium"
						>
							Called {{ tool.toolName }}
						</span>
						<span
							v-if="tool?.result"
							class="text-xs text-muted"
						>
							{{ tool?.result }}
						</span>
					</div>
				</div>
			</template>
		</UChatMessages>
		<slot name="footer" />
	</div>
</template>
