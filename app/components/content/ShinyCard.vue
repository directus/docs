<template>
	<ULandingCard
		v-bind="$attrs"
		class="before:blur-sm before:opacity-50"
	>
		<slot />
	</ULandingCard>
</template>
