<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		type?: 'a' | 'button' | 'submit' | 'reset' | 'span';
		label?: string;
		color?: 'primary' | 'white' | 'outline-only';
		size?: 'small' | 'medium';
		href?: string;
		target?: '_blank' | '_self' | '_parent' | '_top';
		disabled?: boolean;
		loading?: boolean;
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
			disabled: props.disabled || props.loading,
		};
	}

	return {
		disabled: props.disabled || props.loading,
	};
});
</script>

<template>
	<component
		:is="type"
		v-bind="buttonProps"
		:class="['button', `size-${size}`, `color-${color}`, { loading: loading }]"
	>
		<template v-if="!loading">
			{{ label }}
		</template>
		<slot v-if="!loading" />
		<div v-else>
			<p class="loading-text">
				Loading
			</p>
			<div class="loading-icon">
				<Icon name="svg-spinners:180-ring-with-bg" />
			</div>
		</div>
	</component>
</template>

<style scoped lang="scss">
.loading-text {
	opacity: 0;
}

.loading-icon {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.button {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	text-decoration: none;
	border-radius: var(--border-radius);
	border: 1px solid transparent;
	font-weight: 500;
	cursor: pointer;

	&:disabled {
		cursor: not-allowed;
	}
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
	color: white;
	background: var(--primary);
	border-color: var(--primary);

	&:not(:disabled):hover {
		border-color: var(--primary-5);
		background: var(--primary-5);
	}
}

.dark-mode .color-primary {
	border-color: var(--primary-3);
	&:not(:disabled):hover {
		border-color: var(--primary-4);
		background: var(--primary-4);
	}
}

.color-white {
	background: var(--background-subdued);
	color: var(--typography);
	border-color: var(--border);
	&:not(:disabled):hover {
		border-color: var(--border-subdued);
		background: var(--background-subtle);
	}
}
.color-outline-only {
	border-color: var(--border-subdued);
	background: var(--background);
	&:not(:disabled):hover {
		border-color: var(--border-subtle);
		background: var(--background-subdued);
	}
}
</style>
