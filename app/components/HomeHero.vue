<script setup lang="ts">
const search = useSearchOverlay();
function openSearch() {
	search.open();
}
</script>

<template>
	<section class="home-hero not-prose relative mt-6 mb-8 overflow-hidden rounded-2xl bg-slate-950 text-white">
		<HomeHeroShader />

		<div class="home-hero-content relative z-10 p-8 pointer-events-none md:p-12 [&>*]:pointer-events-auto">
			<p class="mb-4 font-mono text-xs font-medium tracking-widest text-white/60 uppercase">
				Documentation
			</p>
			<h1 class="home-hero-title m-0 font-display text-4xl leading-tight font-medium tracking-tight text-white md:text-5xl lg:text-6xl">
				The AI-ready <em class="font-normal">backend</em><br>for your whole team.
			</h1>
			<p class="mt-4 max-w-md text-base leading-7 text-white/70">
				Directus is the open data platform to build custom apps, powerful backends, and content experiences.
			</p>

			<button
				type="button"
				class="home-hero-search mt-7 flex w-full max-w-md cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-white/60"
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
.home-hero {
	--hero-shader-base: #0a0f21;
	--hero-shader-tint: #6644ff;
	box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 10px 24px -16px rgba(0, 0, 0, 0.4);
}

.home-hero-search {
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
	transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
	border-radius: 999px;
}
.home-hero-search:hover {
	background: rgba(255, 255, 255, 0.06);
	border-color: color-mix(in oklab, var(--color-primary) 45%, transparent);
	box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-primary) 12%, transparent);
}

@container docs-pane (max-width: 47.999rem) {
	.home-hero-content {
		padding: 2rem;
	}
	.home-hero-title {
		font-size: 2.25rem;
	}
}
@container docs-pane (min-width: 48rem) {
	.home-hero-content {
		padding: 3rem;
	}
	.home-hero-title {
		font-size: 3rem;
	}
}
@container docs-pane (min-width: 64rem) {
	.home-hero-title {
		font-size: 3.75rem;
	}
}
</style>
