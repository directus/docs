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
</script>

<template>
	<div class="ip-card">
		<Transition
			name="ip-phase"
			mode="out-in"
		>
			<div
				v-if="phase === 'asking'"
				key="asking"
				class="ip-asking"
			>
				<header class="ip-header">
					<div class="ip-header-text">
						<span class="ip-eyebrow">Personalize</span>
						<h3 class="ip-title">
							{{ currentTitle }}
						</h3>
					</div>
					<div class="ip-header-actions">
						<span class="ip-progress">{{ stepIndex + 1 }} of {{ stepKeys.length }}</span>
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
					name="ip-step"
					mode="out-in"
				>
					<div
						:key="currentKey"
						class="ip-step"
					>
						<template v-if="currentKey === 'framework'">
							<UInput
								v-model="frameworkQuery"
								icon="i-ph-magnifying-glass"
								size="sm"
								placeholder="Search frameworks..."
								class="w-full mb-2"
							/>
							<div class="ip-grid ip-grid-frameworks">
								<button
									v-for="f in filteredFrameworks"
									:key="f.slug"
									type="button"
									class="ip-option"
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
									class="ip-empty col-span-full"
								>
									No frameworks match "{{ frameworkQuery }}".
								</p>
							</div>
						</template>

						<template v-else-if="currentKey === 'useCase'">
							<div class="ip-grid ip-grid-usecases">
								<button
									v-for="u in useCases"
									:key="u.slug"
									type="button"
									class="ip-option"
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
							<div class="ip-grid ip-grid-experience">
								<button
									v-for="e in experiences"
									:key="e.slug"
									type="button"
									class="ip-option ip-option-tall"
									@click="pick('experience', e.slug)"
								>
									<UIcon
										:name="e.icon"
										class="size-5 shrink-0"
									/>
									<span class="ip-option-label">{{ e.label }}</span>
									<span class="ip-option-desc">{{ e.description }}</span>
								</button>
							</div>
						</template>
					</div>
				</Transition>
			</div>

			<div
				v-else
				key="done"
				class="ip-done"
			>
				<UIcon
					name="i-ph-check-circle-fill"
					class="size-5 text-primary"
				/>
				<span>All set — your docs are personalized.</span>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.ip-card {
	position: relative;
	border-radius: 0.75rem;
	padding: 1rem 1.125rem;
	background: var(--ui-bg);
	box-shadow: inset 0 0 0 1px var(--ui-border);
}

.ip-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 0.75rem;
	margin-bottom: 0.875rem;
}

.ip-header-text { min-width: 0; }

.ip-eyebrow {
	display: block;
	font-family: var(--font-mono, monospace);
	font-size: 0.625rem;
	font-weight: 500;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: var(--ui-text-muted);
	margin-bottom: 0.25rem;
}

.ip-title {
	font-size: 0.9375rem;
	font-weight: 500;
	color: var(--ui-text-highlighted);
	line-height: 1.3;
	margin: 0;
}

.ip-header-actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex-shrink: 0;
}

.ip-progress {
	font-family: var(--font-mono, monospace);
	font-size: 0.6875rem;
	color: var(--ui-text-muted);
}

.ip-step {
	min-height: 3rem;
}

.ip-grid {
	display: grid;
	gap: 0.375rem;
}

.ip-grid-frameworks {
	grid-template-columns: repeat(2, minmax(0, 1fr));
	max-height: 240px;
	overflow-y: auto;
}
@media (min-width: 32rem) {
	.ip-grid-frameworks { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.ip-grid-usecases {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 32rem) {
	.ip-grid-usecases { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.ip-grid-experience {
	grid-template-columns: 1fr;
}
@media (min-width: 32rem) {
	.ip-grid-experience { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.ip-option {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.625rem;
	border-radius: 0.5rem;
	border: 1px solid var(--ui-border);
	background: transparent;
	font-size: 0.8125rem;
	color: var(--ui-text);
	text-align: left;
	min-width: 0;
	transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
	cursor: pointer;
}
.ip-option:hover {
	border-color: var(--color-primary);
	background: color-mix(in oklab, var(--color-primary) 6%, transparent);
	color: var(--ui-text-highlighted);
}
.ip-option:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.ip-option-tall {
	flex-direction: column;
	align-items: flex-start;
	gap: 0.25rem;
	padding: 0.75rem;
}

.ip-option-label {
	font-weight: 500;
	color: var(--ui-text-highlighted);
	font-size: 0.8125rem;
}

.ip-option-desc {
	font-size: 0.75rem;
	color: var(--ui-text-muted);
	line-height: 1.3;
}

.ip-empty {
	font-size: 0.8125rem;
	color: var(--ui-text-muted);
	font-style: italic;
	padding: 0.5rem 0;
}

.ip-done {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	color: var(--ui-text-highlighted);
	padding: 0.25rem 0;
}

.ip-step-enter-from {
	opacity: 0;
	transform: translateX(12px);
}
.ip-step-leave-to {
	opacity: 0;
	transform: translateX(-12px);
}
.ip-step-enter-active,
.ip-step-leave-active {
	transition: opacity 220ms ease, transform 220ms ease;
}

.ip-phase-enter-from,
.ip-phase-leave-to {
	opacity: 0;
}
.ip-phase-enter-active,
.ip-phase-leave-active {
	transition: opacity 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
	.ip-step-enter-from,
	.ip-step-leave-to {
		transform: none;
	}
}
</style>
