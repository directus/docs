<script setup lang="ts">
import { frameworks } from '#shared/utils/frameworks';
import { useCases } from '~/utils/useCases';
import { deployments } from '~/utils/deployments';
import { roles } from '~/utils/roles';
import { experiences } from '~/utils/experience';
import { libraries } from '~/utils/libraries';

const open = defineModel<boolean>('open', { default: false });
const emit = defineEmits<{ close: [] }>();

const { prefs, library, set, setLibrary, reset } = useUserPreferences();
const { clearRecents, clearFavorites } = usePageHistory();
const { primary: primaryInstanceUrl, addUrl: addInstanceUrl, clearUrls: clearInstanceUrls } = useInstanceUrls();

const instanceUrlInput = ref('');
watch(primaryInstanceUrl, (v) => { instanceUrlInput.value = v ?? ''; }, { immediate: true });

function saveInstanceUrl() {
	if (instanceUrlInput.value.trim()) {
		addInstanceUrl(instanceUrlInput.value);
	}
	else {
		clearInstanceUrls();
	}
}

function resetAll() {
	reset();
	clearRecents();
	clearFavorites();
	clearInstanceUrls();
}

const libraryOptions = libraries;

const frameworkItems = computed(() => frameworks.map(f => ({
	label: f.label, value: f.slug, icon: f.icon,
})));

const useCaseItems = computed(() => useCases.map(u => ({
	label: u.label, value: u.slug, icon: u.icon,
})));

const selectedFramework = computed({
	get: () => frameworkItems.value.find(i => i.value === prefs.value.framework),
	set: item => set('framework', item?.value ?? null),
});

const selectedUseCase = computed({
	get: () => useCaseItems.value.find(i => i.value === prefs.value.useCase),
	set: item => set('useCase', item?.value ?? null),
});
</script>

<template>
	<UDrawer
		v-model:open="open"
		direction="right"
		side="right"
		:handle="false"
		:ui="{ content: 'w-full max-w-full sm:max-w-sm' }"
		@update:open="(value) => { if (!value) emit('close'); }"
	>
		<template #header>
			<div class="flex items-start justify-between">
				<div>
					<h2 class="text-base font-semibold text-highlighted">
						Personalize
					</h2>
					<p class="text-xs text-muted">
						Tailor the docs to your stack.
					</p>
				</div>
				<UButton
					icon="material-symbols:close"
					variant="ghost"
					color="neutral"
					size="sm"
					aria-label="Close"
					@click="emit('close')"
				/>
			</div>
		</template>

		<template #body>
			<div class="space-y-6">
				<section>
					<div class="flex items-center justify-between mb-2 h-6">
						<label class="text-sm font-medium text-highlighted">Preferred Framework</label>
						<UButton
							v-if="prefs.framework"
							label="Clear"
							variant="link"
							size="xs"
							color="neutral"
							@click="set('framework', null)"
						/>
					</div>
					<USelectMenu
						v-model="selectedFramework"
						:items="frameworkItems"
						:search-input="{ placeholder: 'Search frameworks...' }"
						placeholder="Choose a framework"
						class="w-full"
					>
						<template #leading>
							<UIcon
								v-if="selectedFramework?.icon"
								:name="selectedFramework.icon"
								class="size-4"
							/>
							<UIcon
								v-else
								name="material-symbols:code"
								class="size-4 text-dimmed"
							/>
						</template>
						<template #item-leading="{ item }">
							<UIcon
								:name="item.icon"
								class="size-4"
							/>
						</template>
					</USelectMenu>
				</section>

				<section>
					<div class="flex items-center justify-between mb-2 h-6">
						<label class="text-sm font-medium text-highlighted">Primary Use Case</label>
						<UButton
							v-if="prefs.useCase"
							label="Clear"
							variant="link"
							size="xs"
							color="neutral"
							@click="set('useCase', null)"
						/>
					</div>
					<USelectMenu
						v-model="selectedUseCase"
						:items="useCaseItems"
						placeholder="What are you building?"
						class="w-full"
					>
						<template #leading>
							<UIcon
								v-if="selectedUseCase?.icon"
								:name="selectedUseCase.icon"
								class="size-4"
							/>
							<UIcon
								v-else
								name="material-symbols:ads-click"
								class="size-4 text-dimmed"
							/>
						</template>
						<template #item-leading="{ item }">
							<UIcon
								:name="item.icon"
								class="size-4"
							/>
						</template>
					</USelectMenu>
				</section>

				<section>
					<div class="flex items-center justify-between mb-2 h-6">
						<label class="text-sm font-medium text-highlighted">Deployment</label>
						<UButton
							v-if="prefs.deployment"
							label="Clear"
							variant="link"
							size="xs"
							color="neutral"
							@click="set('deployment', null)"
						/>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<button
							v-for="d in deployments"
							:key="d.slug"
							type="button"
							class="flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors"
							:class="prefs.deployment === d.slug
								? 'border-primary bg-primary/5'
								: 'border-default hover:border-accented'"
							@click="set('deployment', d.slug)"
						>
							<UIcon
								:name="d.icon"
								class="size-5"
							/>
							<span class="text-sm font-medium text-highlighted">{{ d.label }}</span>
						</button>
					</div>
				</section>

				<section>
					<div class="flex items-center justify-between mb-2 h-6">
						<label class="text-sm font-medium text-highlighted">API Library</label>
						<UButton
							v-if="library"
							label="Clear"
							variant="link"
							size="xs"
							color="neutral"
							@click="setLibrary(null)"
						/>
					</div>
					<div class="grid grid-cols-3 gap-2">
						<button
							v-for="l in libraryOptions"
							:key="l.value"
							type="button"
							class="flex flex-col items-center gap-1 p-3 rounded-md border text-center transition-colors"
							:class="library === l.value
								? 'border-primary bg-primary/5'
								: 'border-default hover:border-accented'"
							@click="setLibrary(l.value)"
						>
							<UIcon
								:name="l.icon"
								class="size-5"
							/>
							<span class="text-xs font-medium text-highlighted">{{ l.label }}</span>
						</button>
					</div>
					<p class="mt-2 text-xs text-muted">
						Syncs the active tab in API code samples.
					</p>
				</section>

				<section>
					<div class="flex items-center justify-between mb-2 h-6">
						<label class="text-sm font-medium text-highlighted">Role</label>
						<UButton
							v-if="prefs.role"
							label="Clear"
							variant="link"
							size="xs"
							color="neutral"
							@click="set('role', null)"
						/>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<button
							v-for="r in roles"
							:key="r.slug"
							type="button"
							class="flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors"
							:class="prefs.role === r.slug
								? 'border-primary bg-primary/5'
								: 'border-default hover:border-accented'"
							@click="set('role', r.slug)"
						>
							<UIcon
								:name="r.icon"
								class="size-5"
							/>
							<span class="text-sm font-medium text-highlighted">{{ r.label }}</span>
						</button>
					</div>
				</section>

				<section>
					<div class="flex items-center justify-between mb-2 h-6">
						<label class="text-sm font-medium text-highlighted">Experience</label>
						<UButton
							v-if="prefs.experience"
							label="Clear"
							variant="link"
							size="xs"
							color="neutral"
							@click="set('experience', null)"
						/>
					</div>
					<div class="space-y-2">
						<button
							v-for="e in experiences"
							:key="e.slug"
							type="button"
							class="w-full flex items-center gap-3 p-3 rounded-md border text-left transition-colors"
							:class="prefs.experience === e.slug
								? 'border-primary bg-primary/5'
								: 'border-default hover:border-accented'"
							@click="set('experience', e.slug)"
						>
							<UIcon
								:name="e.icon"
								class="size-5 shrink-0"
							/>
							<div class="min-w-0">
								<div class="text-sm font-medium text-highlighted">
									{{ e.label }}
								</div>
								<div class="text-xs text-muted truncate">
									{{ e.description }}
								</div>
							</div>
						</button>
					</div>
				</section>

				<section>
					<div class="flex items-center justify-between mb-2 h-6">
						<label class="text-sm font-medium text-highlighted">Directus Instance</label>
						<UButton
							v-if="primaryInstanceUrl"
							label="Clear"
							variant="link"
							size="xs"
							color="neutral"
							@click="clearInstanceUrls(); instanceUrlInput = ''"
						/>
					</div>
					<form
						class="flex gap-2"
						@submit.prevent="saveInstanceUrl"
					>
						<UInput
							v-model="instanceUrlInput"
							type="url"
							placeholder="https://your-instance.directus.app"
							icon="material-symbols:link"
							class="flex-1"
						/>
						<UButton
							label="Save"
							type="submit"
							color="primary"
							variant="solid"
							size="sm"
							:disabled="instanceUrlInput.trim() === (primaryInstanceUrl ?? '')"
						/>
					</form>
					<p class="mt-2 text-xs text-muted">
						Used to deep-link from docs into your Directus project.
					</p>
				</section>
			</div>
		</template>

		<template #footer>
			<div class="flex justify-between items-center">
				<UButton
					label="Reset all"
					variant="ghost"
					color="neutral"
					size="sm"
					icon="material-symbols:undo"
					@click="resetAll()"
				/>
				<span class="text-xs text-muted">Saved automatically</span>
			</div>
		</template>
	</UDrawer>
</template>
