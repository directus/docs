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
			out.push({ icon: 'i-ph-link', label: new URL(primaryInstanceUrl.value).host });
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
		class="for-you-panel not-prose mt-6 mb-12"
	>
		<header class="for-you-header">
			<span class="for-you-eyebrow">Welcome Back</span>
			<UButton
				label="Personalize"
				icon="i-ph-sliders-horizontal"
				trailing-icon="i-ph-arrow-right"
				variant="ghost"
				color="neutral"
				size="xs"
				@click="openDrawer"
			/>
		</header>

		<div class="for-you-hero">
			<div class="for-you-hero-main">
				<div v-if="resume">
					<div class="for-you-kicker">
						<UIcon
							name="i-ph-bookmark-simple"
							class="size-3.5"
						/>
						Continue reading
					</div>
					<NuxtLink
						:to="resume.path"
						class="for-you-resume-title group"
					>
						<span>{{ resume.title }}</span>
						<UIcon
							name="i-ph-arrow-up-right"
							class="size-5 inline-block ml-1 -mt-1 text-muted group-hover:text-primary transition-colors"
						/>
					</NuxtLink>
					<div class="for-you-resume-meta">
						<span v-if="sectionLabel(resume.path)">{{ sectionLabel(resume.path) }}</span>
						<span
							v-if="sectionLabel(resume.path) && resume.visitedAt"
							class="for-you-dot"
						>·</span>
						<span v-if="resume.visitedAt">{{ relativeTime(resume.visitedAt) }}</span>
					</div>
				</div>

				<div v-else>
					<div class="for-you-kicker">
						<UIcon
							name="i-ph-compass"
							class="size-3.5"
						/>
						Start here
					</div>
					<NuxtLink
						to="/getting-started"
						class="for-you-resume-title group"
					>
						<span>Pick a place to begin</span>
						<UIcon
							name="i-ph-arrow-up-right"
							class="size-5 inline-block ml-1 -mt-1 text-muted group-hover:text-primary transition-colors"
						/>
					</NuxtLink>
					<div class="for-you-resume-meta">
						A short tour through the basics of Directus.
					</div>
				</div>
			</div>

			<aside class="for-you-rail">
				<div class="for-you-kicker">
					<UIcon
						name="i-ph-user-focus"
						class="size-3.5"
					/>
					Your context
				</div>

				<div
					v-if="chips.length"
					class="for-you-chip-list"
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
					trailing-icon="i-ph-arrow-right"
					variant="link"
					color="neutral"
					size="xs"
					class="-mx-2"
					@click="openDrawer"
				/>

				<UButton
					v-if="chips.length"
					label="Edit"
					trailing-icon="i-ph-arrow-right"
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
			class="for-you-lists"
		>
			<div class="for-you-list-col">
				<div class="for-you-kicker">
					<UIcon
						name="i-ph-star-fill"
						class="size-3.5 text-primary/70"
					/>
					Favorites
				</div>
				<ul
					v-if="favorites.length"
					class="for-you-list"
				>
					<li
						v-for="f in favorites.slice(0, 8)"
						:key="f.path"
						class="for-you-row group"
					>
						<NuxtLink
							:to="f.path"
							class="for-you-row-link"
						>
							<span class="for-you-row-marker text-primary/60">★</span>
							<span class="truncate">{{ f.title }}</span>
						</NuxtLink>
						<UButton
							icon="i-ph-x"
							variant="ghost"
							color="neutral"
							size="xs"
							aria-label="Remove favorite"
							class="for-you-row-remove"
							@click="toggleFavorite(f)"
						/>
					</li>
				</ul>
				<p
					v-else
					class="for-you-empty-line"
				>
					Star pages as you read to keep them here.
				</p>
			</div>

			<div
				v-if="restRecents.length"
				class="for-you-list-col"
			>
				<div class="for-you-kicker">
					<UIcon
						name="i-ph-clock-counter-clockwise"
						class="size-3.5"
					/>
					Recently viewed
				</div>
				<ul class="for-you-list">
					<li
						v-for="r in restRecents"
						:key="r.path"
						class="for-you-row"
					>
						<NuxtLink
							:to="r.path"
							class="for-you-row-link"
						>
							<span class="for-you-row-marker">·</span>
							<span class="truncate">{{ r.title }}</span>
						</NuxtLink>
					</li>
				</ul>
			</div>
		</div>
	</section>
</template>

<style scoped>
.for-you-panel {
	position: relative;
	border-radius: 0.875rem;
	overflow: hidden;
	background: var(--ui-bg);
	box-shadow: inset 0 0 0 1px var(--ui-border);
}

.for-you-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem 1.25rem;
}

.for-you-eyebrow {
	font-family: var(--font-mono, monospace);
	font-size: 0.6875rem;
	font-weight: 500;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: var(--ui-text-muted);
}

.for-you-hero {
	display: grid;
	grid-template-columns: 1fr;
	border-top: 1px solid var(--ui-border);
}

@media (min-width: 64rem) {
	.for-you-hero { grid-template-columns: 2fr 1fr; }
}

.for-you-hero-main {
	padding: 1.5rem 1.5rem 1.75rem;
}

.for-you-rail {
	padding: 1.5rem 1.5rem 1.75rem;
	border-top: 1px solid var(--ui-border);
	display: flex;
	flex-direction: column;
	gap: 0.875rem;
}
@media (min-width: 64rem) {
	.for-you-rail {
		border-top: 0;
		border-left: 1px solid var(--ui-border);
	}
}

.for-you-kicker {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	font-family: var(--font-mono, monospace);
	font-size: 0.6875rem;
	font-weight: 500;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--ui-text-muted);
	margin-bottom: 0.625rem;
}

.for-you-resume-title {
	display: block;
	font-family: var(--font-display, var(--font-sans));
	font-size: 1.5rem;
	line-height: 1.15;
	letter-spacing: -0.01em;
	font-weight: 500;
	color: var(--ui-text-highlighted);
	transition: color 0.15s ease;
}
.for-you-resume-title:hover { color: var(--color-primary); }

@media (min-width: 64rem) {
	.for-you-resume-title { font-size: 1.75rem; }
}

.for-you-resume-meta {
	margin-top: 0.625rem;
	font-size: 0.8125rem;
	color: var(--ui-text-muted);
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.375rem;
}
.for-you-dot { color: var(--ui-text-dimmed); }

.for-you-chip-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.375rem;
}

.for-you-lists {
	display: grid;
	grid-template-columns: 1fr;
	border-top: 1px solid var(--ui-border);
}
@media (min-width: 48rem) {
	.for-you-lists { grid-template-columns: 1fr 1fr; }
}

.for-you-list-col {
	padding: 1.25rem 1.5rem 1.5rem;
}
.for-you-list-col + .for-you-list-col {
	border-top: 1px solid var(--ui-border);
}
@media (min-width: 48rem) {
	.for-you-list-col + .for-you-list-col {
		border-top: 0;
		border-left: 1px solid var(--ui-border);
	}
}

.for-you-list {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
}

.for-you-row {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.for-you-row-link {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	color: var(--ui-text);
	min-width: 0;
	max-width: 100%;
	padding: 0.25rem 0;
	transition: color 0.15s ease;
}
.for-you-row-link:hover { color: var(--color-primary); }

.for-you-row-marker {
	display: inline-block;
	width: 0.875rem;
	text-align: center;
	color: var(--ui-text-dimmed);
	font-size: 0.875rem;
	flex-shrink: 0;
}

.for-you-row-remove {
	opacity: 0;
	transition: opacity 0.15s ease;
}
.for-you-row:hover .for-you-row-remove { opacity: 1; }

.for-you-empty-line {
	font-size: 0.8125rem;
	color: var(--ui-text-muted);
	font-style: italic;
}

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
