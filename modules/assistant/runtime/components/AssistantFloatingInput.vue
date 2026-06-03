<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import { strings } from '../strings';

const route = useRoute();
const { open, isOpen } = useAssistant();
const input = ref('');
const inputRef = ref<{ inputRef: HTMLInputElement } | null>(null);

const isDocsRoute = computed(() => route.meta.layout === 'docs');

function handleSubmit() {
	if (!input.value.trim()) return;
	open(input.value, true);
	input.value = '';
}

defineShortcuts({
	meta_i: {
		usingInput: true,
		handler: () => {
			if (!isDocsRoute.value) return;
			inputRef.value?.inputRef?.focus();
		},
	},
});

function handleEscape() {
	inputRef.value?.inputRef?.blur();
}
</script>

<template>
	<AnimatePresence>
		<motion.div
			v-if="isDocsRoute && !isOpen"
			key="floating-input"
			:initial="{ y: 20, opacity: 0 }"
			:animate="{ y: 0, opacity: 1 }"
			:exit="{ y: 100, opacity: 0 }"
			:transition="{ duration: 0.2, ease: 'easeOut' }"
			class="pointer-events-none fixed inset-x-0 z-10 bottom-[max(1.5rem,env(safe-area-inset-bottom))] px-4 sm:px-80"
			style="will-change: transform"
		>
			<form
				class="pointer-events-none flex w-full justify-center"
				@submit.prevent="handleSubmit"
			>
				<div class="pointer-events-auto w-full max-w-96">
					<UInput
						ref="inputRef"
						v-model="input"
						:placeholder="strings.placeholder"
						size="lg"
						maxlength="1000"
						:ui="{
							root: 'group w-full! min-w-0 sm:max-w-96 transition-all duration-300 ease-out [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:focus-within:scale-105',
							base: 'bg-default shadow-lg rounded-xl text-base',
							trailing: 'pe-2',
						}"
						@keydown.enter.exact.prevent="handleSubmit"
						@keydown.esc="handleEscape"
					>
						<template #trailing>
							<div class="flex items-center gap-2">
								<div class="hidden sm:flex group-focus-within:hidden items-center gap-1">
									<UKbd value="meta" />
									<UKbd value="I" />
								</div>

								<UButton
									type="submit"
									icon="i-lucide-arrow-up"
									color="primary"
									size="xs"
									:disabled="!input.trim()"
								/>
							</div>
						</template>
					</UInput>
				</div>
			</form>
		</motion.div>
	</AnimatePresence>
</template>
