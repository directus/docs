<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		type?: 'a' | 'button' | 'submit' | 'reset' | 'span';
		label: string;
		color?: 'primary' | 'white' | 'outline-only';
		size?: 'small' | 'medium';
		href?: string;
		target?: '_blank' | '_self' | '_parent' | '_top';
	}>(),
	{
		type: 'button',
		color: 'primary',
		size: 'medium',
	},
);

const buttonProps = computed(() => {
	if (props.href) {
		return {
			href: props.href,
			target: props.target,
		};
	}

	return {};
});
</script>

<template>
	<component
		:is="type"
		v-bind="buttonProps"
		:class="['button', `size-${size}`, `color-${color}`]"
	>
		{{ label }}
	</component>
</template>

<style scoped lang="scss">
.button {
	display: inline-block;
	text-decoration: none;
	border-radius: var(--border-radius);
	border: 1px solid transparent;
	font-weight: 500;
}
.size-small {
	font-size: 14px;
	padding: 0.2rem 0.6rem;
}
.size-medium {
	font-size: 1rem;
	padding: 0.25rem 0.75rem;
}
.color-primary {
	background: var(--primary);
	color: white;
	border-color: var(--primary);
	&:hover {
		border-color: var(--primary-5);
		background: var(--primary-5);
	}
}
.dark-mode .color-primary {
	border-color: var(--primary-3);
	&:hover {
		border-color: var(--primary-4);
		background: var(--primary-4);
	}
}

.color-white {
	background: var(--background-subdued);
	color: var(--typography);
	border-color: var(--border);
	&:hover {
		border-color: var(--border-subdued);
		background: var(--background-subtle);
	}
}
.color-outline-only {
	border-color: var(--border-subdued);
	&:hover {
		border-color: var(--border-subtle);
		background: var(--background-subdued);
	}
}
</style>
