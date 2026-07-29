<script setup lang="ts">
import { frameworks } from '#shared/utils/frameworks';
import { useCases } from '~/utils/useCases';
import { experiences } from '~/utils/experience';

const emit = defineEmits<{ complete: []; dismiss: [] }>();

const { set } = useUserPreferences();

const stepIndex = ref(0);
const phase = ref<'asking' | 'done'>('asking');
const frameworkQuery = ref('');
const answersGiven = ref(0);

type StepKey = 'framework' | 'useCase' | 'experience';

const stepKeys: StepKey[] = ['framework', 'useCase', 'experience'];
const stepTitles: Record<StepKey, string> = {
	framework: 'Which framework do you use?',
	useCase: 'What are you building?',
	experience: 'How familiar are you with Directus?',
};

const currentKey = computed(() => stepKeys[stepIndex.value]!);
const currentTitle = computed(() => stepTitles[currentKey.value]);
const skipsUsed = ref(0);

const filteredFrameworks = computed(() => {
	const q = frameworkQuery.value.trim().toLowerCase();
	if (!q) return frameworks;
	return frameworks.filter(f => f.label.toLowerCase().includes(q));
});

function advance() {
	if (stepIndex.value < stepKeys.length - 1) {
		stepIndex.value += 1;
		frameworkQuery.value = '';
		return;
	}
	finish();
}

function pick(key: StepKey, slug: string) {
	set(key, slug);
	answersGiven.value += 1;
	advance();
}

function skip() {
	skipsUsed.value += 1;
	advance();
}

function finish() {
	if (answersGiven.value === 0) {
		emit('dismiss');
		return;
	}
	phase.value = 'done';
	setTimeout(() => emit('complete'), 1200);
}

const optionBase = 'inline-flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-default px-2.5 py-2 text-left text-sm text-default transition-colors hover:border-primary hover:bg-primary/5 hover:text-highlighted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
</script>

<template>
	<div class="relative w-full max-w-full overflow-hidden rounded-xl border border-default bg-default px-4 py-4">
		<Transition
			mode="out-in"
			enter-active-class="transition-opacity duration-200"
			enter-from-class="opacity-0"
			leave-active-class="transition-opacity duration-200"
			leave-to-class="opacity-0"
		>
			<div
				v-if="phase === 'asking'"
				key="asking"
			>
				<header class="mb-3.5 flex flex-col gap-3 @min-[28rem]/docs-pane:flex-row @min-[28rem]/docs-pane:items-start @min-[28rem]/docs-pane:justify-between">
					<div class="min-w-0">
						<DocsEyebrow class="mb-1">
							Personalize
						</DocsEyebrow>
						<h3 class="text-sm font-medium leading-snug text-highlighted">
							{{ currentTitle }}
						</h3>
					</div>
					<div class="flex shrink-0 items-center justify-between gap-2 @min-[28rem]/docs-pane:justify-start">
						<span class="font-mono text-xs text-muted">{{ stepIndex + 1 }} of {{ stepKeys.length }}</span>
						<UButton
							label="Skip"
							variant="ghost"
							color="neutral"
							size="xs"
							@click="skip"
						/>
					</div>
				</header>

				<Transition
					mode="out-in"
					enter-active-class="transition duration-200 ease-out"
					enter-from-class="opacity-0 translate-x-3 motion-reduce:translate-x-0"
					leave-active-class="transition duration-200 ease-in"
					leave-to-class="opacity-0 -translate-x-3 motion-reduce:translate-x-0"
				>
					<div
						:key="currentKey"
						class="min-h-12"
					>
						<template v-if="currentKey === 'framework'">
							<UInput
								v-model="frameworkQuery"
								icon="i-lucide-search"
								size="sm"
								placeholder="Search frameworks..."
								class="w-full mb-2"
							/>
							<div class="grid max-h-60 grid-cols-1 gap-1.5 overflow-y-auto @min-[28rem]/docs-pane:grid-cols-2 @min-[44rem]/docs-pane:grid-cols-3">
								<button
									v-for="f in filteredFrameworks"
									:key="f.slug"
									type="button"
									:class="optionBase"
									@click="pick('framework', f.slug)"
								>
									<UIcon
										:name="f.icon"
										class="size-4 shrink-0"
									/>
									<span class="truncate">{{ f.label }}</span>
								</button>
								<p
									v-if="!filteredFrameworks.length"
									class="col-span-full py-2 text-sm text-muted italic"
								>
									No frameworks match "{{ frameworkQuery }}".
								</p>
							</div>
						</template>

						<template v-else-if="currentKey === 'useCase'">
							<div class="grid grid-cols-1 gap-1.5 @min-[28rem]/docs-pane:grid-cols-2 @min-[44rem]/docs-pane:grid-cols-3">
								<button
									v-for="u in useCases"
									:key="u.slug"
									type="button"
									:class="optionBase"
									@click="pick('useCase', u.slug)"
								>
									<UIcon
										:name="u.icon"
										class="size-4 shrink-0"
									/>
									<span class="truncate">{{ u.label }}</span>
								</button>
							</div>
						</template>

						<template v-else>
							<div class="grid grid-cols-1 gap-1.5 @min-[44rem]/docs-pane:grid-cols-3">
								<button
									v-for="e in experiences"
									:key="e.slug"
									type="button"
									class="flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-lg border border-default p-3 text-left text-sm text-default transition-colors hover:border-primary hover:bg-primary/5 hover:text-highlighted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
									@click="pick('experience', e.slug)"
								>
									<UIcon
										:name="e.icon"
										class="size-5 shrink-0"
									/>
									<span class="text-sm font-medium text-highlighted">{{ e.label }}</span>
									<span class="text-xs leading-snug text-muted">{{ e.description }}</span>
								</button>
							</div>
						</template>
					</div>
				</Transition>
			</div>

			<div
				v-else
				key="done"
				class="flex items-center gap-2 py-1 text-sm text-highlighted"
			>
				<UIcon
					name="i-lucide-circle-check"
					class="size-5 text-primary"
				/>
				<span>All set — your docs are personalized.</span>
			</div>
		</Transition>
	</div>
</template>
