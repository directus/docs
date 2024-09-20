<template>
	<header class="container">
		<NuxtLink to="/">
			<HeaderLogo />
		</NuxtLink>
		<SearchButton />
		<div class="links">
			<a
				href="https://x.com/directus"
				target="_blank"
			>
				<Icon name="ri:twitter-x-fill" />
			</a>
			<a
				href="https://github.com/directus/directus"
				target="_blank"
			>
				<Icon name="ri:github-fill" />
			</a>
			<a
				href="https://directus.chat"
				target="_blank"
			>
				<Icon name="ri:discord-fill" />
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
</template>

<style scoped lang="scss">
header {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 2rem;
	padding-top: 1rem;
	padding-bottom: 1rem;
	position: sticky;
	top: 0px;
	z-index: 900;
	background-color: var(--background);
}

.links {
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
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
}
</style>
