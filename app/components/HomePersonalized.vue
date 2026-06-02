<script setup lang="ts">
const {
	framework, useCase, deployment, role, experience,
	onboardingState,
	startOnboarding, completeOnboarding, dismissOnboarding,
	touchCookie,
} = useUserPreferences();
const { recents, favorites, toggleFavorite } = usePageHistory();
const { primary: primaryInstanceUrl } = useInstanceUrls();

const settings = useSettingsOverlay();
function openDrawer() { settings.open(); }

const showInline = computed(() => onboardingState.value === 'active');
const showIdleCta = computed(() => onboardingState.value === 'idle');

const resume = computed(() => recents.value[0] ?? null);
const restRecents = computed(() => recents.value.slice(1, 7));

const chips = computed(() => {
	const out: { icon: string; label: string }[] = [];
	if (framework.value) out.push({ icon: framework.value.icon, label: framework.value.label });
	if (experience.value) out.push({ icon: experience.value.icon, label: experience.value.label });
	if (deployment.value) out.push({ icon: deployment.value.icon, label: deployment.value.label });
	if (useCase.value) out.push({ icon: useCase.value.icon, label: useCase.value.label });
	if (role.value) out.push({ icon: role.value.icon, label: role.value.label });
	if (primaryInstanceUrl.value) {
		try {
			out.push({ icon: 'i-lucide-link', label: new URL(primaryInstanceUrl.value).host });
		}
		catch { /* ignore */ }
	}
	return out;
});

const hasAnyPref = computed(() =>
	Boolean(framework.value || useCase.value || deployment.value || role.value || experience.value || primaryInstanceUrl.value));

const showPanel = computed(() =>
	onboardingState.value === 'onboarded'
	&& (hasAnyPref.value || recents.value.length > 0 || favorites.value.length > 0));

onMounted(() => {
	touchCookie();
});

function sectionLabel(path: string): string {
	const parts = path.split('/').filter(Boolean).slice(0, 2);
	if (!parts.length) return '';
	return parts
		.map(p => p.replace(/^\d+\./, '').replace(/-/g, ' '))
		.map(p => p.charAt(0).toUpperCase() + p.slice(1))
		.join(' / ');
}

function relativeTime(ts?: number): string {
	if (!ts) return '';
	const min = Math.round((Date.now() - ts) / 60000);
	if (min < 1) return 'just now';
	if (min < 60) return `${min}m ago`;
	const h = Math.round(min / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.round(h / 24)}d ago`;
}
</script>

<template>
	<div
		v-if="showIdleCta"
		class="not-prose mt-6 mb-12"
	>
		<PersonalizeIdleCta
			@start="startOnboarding"
			@dismiss="dismissOnboarding"
		/>
	</div>

	<div
		v-else-if="showInline"
		class="not-prose mt-6 mb-12"
	>
		<InlinePersonalize
			@complete="completeOnboarding"
			@dismiss="dismissOnboarding"
		/>
	</div>

	<section
		v-else-if="showPanel"
		class="for-you-panel not-prose relative mt-6 mb-12 overflow-hidden rounded-xl border border-default bg-default"
	>
		<header class="flex items-center justify-between px-5 py-4">
			<DocsEyebrow>Welcome Back</DocsEyebrow>
			<UButton
				label="Personalize"
				icon="i-lucide-sliders-horizontal"
				trailing-icon="i-lucide-arrow-right"
				variant="ghost"
				color="neutral"
				size="xs"
				@click="openDrawer"
			/>
		</header>

		<div class="grid grid-cols-1 divide-y divide-default border-t border-default @min-[64rem]/docs-pane:grid-cols-[2fr_1fr] @min-[64rem]/docs-pane:divide-x @min-[64rem]/docs-pane:divide-y-0">
			<div class="p-6 pb-7">
				<div v-if="resume">
					<DocsEyebrow
						icon="i-lucide-bookmark"
						class="mb-2.5"
					>
						Continue reading
					</DocsEyebrow>
					<NuxtLink
						:to="resume.path"
						class="group block font-display text-2xl font-medium leading-tight tracking-tight text-highlighted transition-colors hover:text-primary @min-[64rem]/docs-pane:text-3xl"
					>
						<span>{{ resume.title }}</span>
						<UIcon
							name="i-lucide-arrow-up-right"
							class="size-5 inline-block ml-1 -mt-1 text-muted group-hover:text-primary transition-colors"
						/>
					</NuxtLink>
					<div class="mt-2.5 flex flex-wrap items-center gap-1.5 text-sm text-muted">
						<span v-if="sectionLabel(resume.path)">{{ sectionLabel(resume.path) }}</span>
						<span
							v-if="sectionLabel(resume.path) && resume.visitedAt"
							class="text-dimmed"
						>·</span>
						<span v-if="resume.visitedAt">{{ relativeTime(resume.visitedAt) }}</span>
					</div>
				</div>

				<div v-else>
					<DocsEyebrow
						icon="i-lucide-compass"
						class="mb-2.5"
					>
						Start here
					</DocsEyebrow>
					<NuxtLink
						to="/getting-started/overview"
						class="group block font-display text-2xl font-medium leading-tight tracking-tight text-highlighted transition-colors hover:text-primary @min-[64rem]/docs-pane:text-3xl"
					>
						<span>Pick a place to begin</span>
						<UIcon
							name="i-lucide-arrow-up-right"
							class="size-5 inline-block ml-1 -mt-1 text-muted group-hover:text-primary transition-colors"
						/>
					</NuxtLink>
					<div class="mt-2.5 text-sm text-muted">
						A short tour through the basics of Directus.
					</div>
				</div>
			</div>

			<aside class="flex flex-col gap-3.5 p-6 pb-7">
				<DocsEyebrow icon="i-lucide-user-search">
					Your context
				</DocsEyebrow>

				<div
					v-if="chips.length"
					class="flex flex-wrap gap-1.5"
				>
					<UBadge
						v-for="c in chips"
						:key="c.label"
						:label="c.label"
						:icon="c.icon"
						color="neutral"
						variant="subtle"
						size="md"
					/>
				</div>

				<UButton
					v-else
					label="Tell us about your stack"
					trailing-icon="i-lucide-arrow-right"
					variant="link"
					color="neutral"
					size="xs"
					class="-mx-2"
					@click="openDrawer"
				/>

				<UButton
					v-if="chips.length"
					label="Edit"
					trailing-icon="i-lucide-arrow-right"
					variant="link"
					color="neutral"
					size="xs"
					class="-mx-2"
					@click="openDrawer"
				/>
			</aside>
		</div>

		<div
			v-if="favorites.length || restRecents.length"
			class="grid grid-cols-1 divide-y divide-default border-t border-default @min-[48rem]/docs-pane:grid-cols-2 @min-[48rem]/docs-pane:divide-x @min-[48rem]/docs-pane:divide-y-0"
		>
			<div class="px-6 pt-5 pb-6">
				<DocsEyebrow
					icon="i-lucide-star"
					class="mb-2.5"
				>
					Favorites
				</DocsEyebrow>
				<ul
					v-if="favorites.length"
					class="flex flex-col gap-0.5"
				>
					<li
						v-for="f in favorites.slice(0, 8)"
						:key="f.path"
						class="group flex items-center gap-2"
					>
						<NuxtLink
							:to="f.path"
							class="inline-flex min-w-0 max-w-full items-center gap-2 py-1 text-sm text-default transition-colors hover:text-primary"
						>
							<span class="inline-block w-3.5 shrink-0 text-center text-sm text-primary/60">★</span>
							<span class="truncate">{{ f.title }}</span>
						</NuxtLink>
						<UButton
							icon="i-lucide-x"
							variant="ghost"
							color="neutral"
							size="xs"
							aria-label="Remove favorite"
							class="opacity-0 transition-opacity group-hover:opacity-100"
							@click="toggleFavorite(f)"
						/>
					</li>
				</ul>
				<p
					v-else
					class="text-sm text-muted italic"
				>
					Star pages as you read to keep them here.
				</p>
			</div>

			<div
				v-if="restRecents.length"
				class="px-6 pt-5 pb-6"
			>
				<DocsEyebrow
					icon="i-lucide-history"
					class="mb-2.5"
				>
					Recently viewed
				</DocsEyebrow>
				<ul class="flex flex-col gap-0.5">
					<li
						v-for="r in restRecents"
						:key="r.path"
						class="flex items-center gap-2"
					>
						<NuxtLink
							:to="r.path"
							class="inline-flex min-w-0 max-w-full items-center gap-2 py-1 text-sm text-default transition-colors hover:text-primary"
						>
							<span class="inline-block w-3.5 shrink-0 text-center text-sm text-dimmed">·</span>
							<span class="truncate">{{ r.title }}</span>
						</NuxtLink>
					</li>
				</ul>
			</div>
		</div>
	</section>
</template>

<style scoped>
@keyframes for-you-rise {
	from { opacity: 0; transform: translateY(6px); }
	to { opacity: 1; transform: none; }
}

.for-you-panel > * {
	animation: for-you-rise 0.5s ease-out backwards;
}
.for-you-panel > *:nth-child(2) { animation-delay: 0.08s; }
.for-you-panel > *:nth-child(3) { animation-delay: 0.16s; }

@media (prefers-reduced-motion: reduce) {
	.for-you-panel > * { animation: none; }
}
</style>
