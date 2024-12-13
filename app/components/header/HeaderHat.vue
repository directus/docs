<script setup lang="ts">
import { appConfig } from '~~/utils/app-config';

const isOpen = ref(false);

const { data } = await useAsyncData('appConfig', appConfig);
</script>

<template>
	<div>
		<HeaderSlideover v-model="isOpen">
			<slot />
		</HeaderSlideover>
		<header class="container nav-hat">
			<button
				class="slideover-toggle"
				@click="isOpen = !isOpen"
			>
				<Icon name="material-symbols:menu" />
			</button>
			<NuxtLink to="/">
				<HeaderLogo />
			</NuxtLink>
			<SearchButton style="flex-grow: 1;" />
			<div
				v-if="data?.footer"
				class="links"
			>
				<a
					v-for="social in data.footer.socials"
					:key="social.href"
					:href="social.href"
					target="_blank"
				>
					<Icon :name="social.icon" />
				</a>
				<Button
					type="a"
					label="Register"
					href="https://directus.cloud/register"
					target="_blank"
					color="outline-only"
					size="small"
					class="register"
				/>
				<Button
					type="a"
					label="Sign In"
					href="https://directus.cloud"
					target="_blank"
					color="primary"
					size="small"
				/>
			</div>
		</header>
	</div>
</template>

<style scoped lang="scss">
.nav-hat {
	display: flex;
	align-items: center;
	justify-content: space-between;
	column-gap: 1rem;
	padding-top: 1rem;
	padding-bottom: 1rem;

	@media (max-width: 768px) {
		border-bottom: 1px solid var(--border);
		background-color: var(--background);
	}
}

.slideover-toggle {
	display: none;

	@media (max-width: 768px) {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: var(--typography);
		font-size: 1.5rem;
		cursor: pointer;
		height: 40px;
		width: 40px;
	}
}

.links {
	display: flex;
	justify-content: flex-end;
	column-gap: 1rem;
	align-items: center;
	.icon {
		color: var(--typography-subdued);
		margin-bottom: 1px;
		&:hover {
			color: var(--typography);
		}
	}
	.register {
		margin-right: -0.5rem;
	}

	@media (max-width: 768px) {
		display: none;
	}

	a {
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
</style>
