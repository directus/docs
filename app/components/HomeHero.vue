<script setup lang="ts">
const search = useSearchOverlay();
function openSearch() {
	search.open();
}
</script>

<template>
	<section
		class="not-prose relative mt-6 mb-8 overflow-hidden rounded-2xl bg-neutral-950 text-white shadow-[0_10px_24px_-16px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.06]"
	>
		<div class="hero-mask absolute inset-0">
			<ClientOnly>
				<HomeHeroShader :anchor-y="0.5" :wash-amount="0" />
			</ClientOnly>
		</div>

		<div
			id="hero-shader-debug-slot"
			class="absolute top-0 right-0 z-30"
		/>

		<div class="relative z-10 p-8 pb-16 @min-[48rem]/docs-pane:p-12 @min-[48rem]/docs-pane:pb-20">
			<p class="mb-4 font-mono text-xs font-medium tracking-widest text-white/60 uppercase">
				Documentation
			</p>
			<h1 class="m-0 font-display text-4xl leading-tight font-medium tracking-tight text-white @min-[48rem]/docs-pane:text-5xl @min-[64rem]/docs-pane:text-6xl">
				A backend your whole team can use.
			</h1>
			<p class="mt-4 max-w-md text-base leading-7 text-white/70">
				Wrap any SQL database to get instant APIs, a Studio your team can actually use, and a native MCP server. One role-based access layer governs all of it.
			</p>
			<button
				type="button"
				class="home-hero-search mt-7 flex w-full max-w-md cursor-pointer items-center gap-3 rounded-full px-4 py-3 text-left text-sm text-white/60"
				aria-label="Search documentation"
				@click="openSearch"
			>
				<UIcon
					name="heroicons:magnifying-glass-20-solid"
					class="size-4 shrink-0 text-white/60"
				/>
				<span class="flex-1">Search the docs...</span>
				<kbd class="rounded border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/70">⌘K</kbd>
			</button>
			<div class="mt-6 flex flex-wrap gap-2.5">
				<UButton
					label="Get Started"
					trailing-icon="i-ph-arrow-right"
					color="primary"
					size="lg"
					to="/getting-started/overview"
				/>
				<UButton
					label="What is Directus?"
					trailing-icon="i-ph-play"
					color="neutral"
					variant="subtle"
					size="lg"
					to="/getting-started/overview"
				/>
			</div>
		</div>
	</section>
</template>

<style scoped>
.hero-mask {
	--hero-mask: linear-gradient(
		to bottom,
		transparent 0%,
		transparent 20%,
		rgba(0, 0, 0, 0.2) 55%,
		rgba(0, 0, 0, 0.65) 85%,
		black 100%
	);
	-webkit-mask-image: var(--hero-mask);
	mask-image: var(--hero-mask);
	-webkit-mask-repeat: no-repeat;
	mask-repeat: no-repeat;
	-webkit-mask-size: 100% 100%;
	mask-size: 100% 100%;
}

.home-hero-search {
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
	transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.home-hero-search:hover {
	background: rgba(255, 255, 255, 0.06);
	border-color: color-mix(in oklab, var(--color-primary) 45%, transparent);
	box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-primary) 12%, transparent);
}
</style>
