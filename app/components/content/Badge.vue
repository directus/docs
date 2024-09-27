<script setup lang="ts">
withDefaults(
	defineProps<{
		text: string;
		small?: boolean;
		iconBefore?: string;
		iconAfter?: string;
		color?: 'gray' | 'primary';
	}>(),
	{
		small: false,
		color: 'gray',
	},
);
</script>

<template>
	<span :class="`badge color-${color} ${small ? 'small' : ''}`">
		<Icon
			v-if="iconBefore"
			:name="iconBefore"
			:size="small ? '0.75rem' : '1rem'"
		/>
		<span>{{ text }}</span>
		<Icon
			v-if="iconAfter"
			:name="iconAfter"
			:size="small ? '0.75rem' : '1rem'"
		/>
	</span>
</template>

<style scoped>
.badge {
	background: transparent;
	color: var(--typography-subdued);
	border: 1px solid var(--typography-subdued);
	border-radius: 100em;
	text-transform: uppercase;
	text-decoration: none;
	padding: 0.2rem 0.5rem;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
}

.color-primary {
	background-color: var(--primary);
	border: 1px solid var(--primary-5);
	color: white;
}

.small {
	font-size: 0.75rem;
	padding: 0 0.5rem;
}
</style>
