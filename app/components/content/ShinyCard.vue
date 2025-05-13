<template>
	<UPageCard
		v-bind="$attrs"
		class="before:blur-sm before:opacity-50 not-prose"
	>
		<template #title>
			{{ $attrs.title }}
		</template>

		<slot />
	</UPageCard>
</template>
