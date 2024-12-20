<template>
	<ULandingCard
		v-bind="$attrs"
		class="before:blur-sm before:opacity-50"
	>
		<template #title>
			{{ $attrs.title }}
		</template>
		<slot />
	</ULandingCard>
</template>
