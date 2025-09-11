<script setup lang="ts">
interface Message {
	role: 'user' | 'assistant';
	content: string;
}

interface ChatProps {
	messages: Message[];
}

const props = defineProps<ChatProps>();

// Add missing ids for TS
const messages = computed(() => {
	return props.messages.map((message, index) => ({
		...message,
		id: `${message.role}-${index}`,
	}));
});
</script>

<template>
	<div class="border border-accented rounded-lg p-4">
		<UChatMessages
			:messages="messages"
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
			</template>
		</UChatMessages>
		<slot name="footer" />
	</div>
</template>
