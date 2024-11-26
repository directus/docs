<script setup lang="ts">
const switcherState = ref<'data' | 'auth' | 'realtime' | 'file'>('data');
</script>

<template>
	<div class="hero">
		<HeaderHat />
		<div class="container">
			<div class="main">
				<div class="content">
					<h1>
						Learn how to get started and implement Directus through our
						developer resources.
					</h1>
					<!-- <div class="tutorials">
						<div class="frameworks">
							<NuxtLink to="#">
								<Icon name="simple-icons:nextdotjs" />
							</NuxtLink>
							<NuxtLink to="#">
								<Icon name="simple-icons:nuxtdotjs" />
							</NuxtLink>
							<NuxtLink to="#">
								<Icon name="simple-icons:svelte" />
							</NuxtLink>
							<NuxtLink to="#">
								<Icon name="simple-icons:astro" />
							</NuxtLink>
							<NuxtLink to="#">
								<Icon name="simple-icons:react" />
							</NuxtLink>
							<NuxtLink to="#">
								<Icon name="simple-icons:vuedotjs" />
							</NuxtLink>
							<NuxtLink to="#">
								<Icon name="simple-icons:angular" />
							</NuxtLink>
							<NuxtLink to="#">
								<Icon name="simple-icons:apple" />
							</NuxtLink>
							<NuxtLink to="#">
								<Icon name="simple-icons:remix" />
							</NuxtLink>
						</div>

						<Button
							type="a"
							label="See all tutorials"
							href="/tutorials"
							color="white"
							size="small"
							class="all"
						/>
					</div> -->
				</div>
				<div class="code-wrapper">
					<div class="code">
						<div class="switcher">
							<Button
								label="Fetch Data"
								:color="switcherState === 'data' ? 'primary' : 'white'"
								size="small"
								@click="switcherState = 'data'"
							/>
							<Button
								label="Authentication"
								:color="switcherState === 'auth' ? 'primary' : 'white'"
								size="small"
								@click="switcherState = 'auth'"
							/>
							<Button
								label="Realtime"
								:color="switcherState === 'realtime' ? 'primary' : 'white'"
								size="small"
								@click="switcherState = 'realtime'"
							/>
							<Button
								label="Transform Files"
								:color="switcherState === 'file' ? 'primary' : 'white'"
								size="small"
								@click="switcherState = 'file'"
							/>
						</div>
						<div :style="{ display: switcherState === 'data' ? 'block' : 'none' }">
							<ContentDoc
								path="/_partials/home-hero/data"
								:head="false"
							>
								<template #default="{ doc }">
									<ContentRenderer :value="doc" />
								</template>
							</ContentDoc>
						</div>
						<div :style="{ display: switcherState === 'auth' ? 'block' : 'none' }">
							<ContentDoc
								path="/_partials/home-hero/auth"
								:head="false"
							>
								<template #default="{ doc }">
									<ContentRenderer :value="doc" />
								</template>
							</ContentDoc>
						</div>
						<div :style="{ display: switcherState === 'realtime' ? 'block' : 'none' }">
							<ContentDoc
								path="/_partials/home-hero/realtime"
								:head="false"
							>
								<template #default="{ doc }">
									<ContentRenderer :value="doc" />
								</template>
							</ContentDoc>
						</div>
						<div :style="{ display: switcherState === 'file' ? 'block' : 'none' }">
							<ContentDoc
								path="/_partials/home-hero/file"
								:head="false"
							>
								<template #default="{ doc }">
									<ContentRenderer :value="doc" />
								</template>
							</ContentDoc>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.hero {
	background-image: url("/waves.svg");
	background-size: cover;
}

.dark {
	.hero {
		background-image: url("/waves-dark.svg");
	}
}
.main {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	justify-content: space-between;
	padding-top: 4rem;
	padding-bottom: 4rem;
	column-gap: 2rem;
	row-gap: 1rem;
}

h1 {
	font-weight: 600;
	text-wrap: balance;
}

.content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	max-width: 600px;
}

.tutorials {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 1rem;
}

.frameworks {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-top: 2rem;

	@media (max-width: 1024px) {
		flex-wrap: wrap;
	}

	a {
		font-size: 1.5rem;
		background: var(--background);
		aspect-ratio: 1/1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: calc(var(--border-radius) * 3);
		border: 1px solid var(--border-subdued);
		padding: 0.75rem;
		&:hover {
			background: var(--background-subdued);
		}
	}
}

.code-wrapper {
	display: flex;
	align-items: center;
	height: 100%;
	flex: 1;
	overflow: hidden;
	min-width: 400px;
}

.code {
	background-color: var(--background);
	width: 100%;
	border: 1px solid var(--border-subdued);
	border-radius: var(--border-radius);
	padding: 0.5rem;
}

.switcher {
	display: flex;
	gap: 1rem;
	margin-bottom: 0.5rem;
	white-space: nowrap;
	overflow-x: auto;
	scrollbar-width: none;
}
</style>
