<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		product: keyof typeof productLinks;
		compact?: boolean;
		color?: 'color' | 'white' | 'purple' | 'pink';
		link?: boolean;
	}>(),
	{
		compact: true,
		color: 'color',
		link: true,
	},
);

function componentType() {
	return props.link ? resolveComponent('NuxtLink') : 'span';
}
</script>

<template>
	<component
		:is="componentType()"
		:class="`product product-${color}`"
		:to="link ? productLinks[props.product] : undefined"
	>
		<Icon
			style="margin-bottom: -2px;"
			:name="`directus:${product}${color == 'color' ? '' : '-'+color}`"
		/>
		<span
			v-title
			:class="`text ${color}`"
		>{{ compact ? product : 'Directus ' + product }}</span>
	</component>
</template>

<style scoped lang="scss">
.product {
	display: inline-block;
	text-decoration: none;
    position: relative;
    transition: 0.3s;
	.text {
		display: inline;
		margin-left: 0.3rem;
		font-family: var(--font--header);
		font-weight: 500;
		&.color {
			background-color: var(--typography);
			background-image: linear-gradient(45deg, var(--primary), var(--secondary));
			background-size: 100%;
			background-repeat: repeat;
			background-clip: text;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			-moz-background-clip: text;
			-moz-text-fill-color: transparent;
		}
		&.white {
			color: white;
		}
		&.purple  {
			color: var(--purple-5)
		}
		&.pink  {
			color: var(--pink-5)
		}
	}
}

.product-color:hover::before {
    content:"";
    position: absolute;
    inset: 0;
    transform: translate3d(0,0,-1px);
    filter: blur(5px);
    background: linear-gradient(90deg, rgba(102,68,255,1) 0%, rgba(255,153,221,1) 100%);
    z-index: -1;
    opacity: 15%;
    border-radius: 100000px;
}

.product-purple:hover::before {
    content:"";
    position: absolute;
    inset: 0;
    transform: translate3d(0,0,-1px);
    filter: blur(5px);
    background: linear-gradient(90deg, rgba(102,68,255,1) 0%, rgba(102,68,255,1) 100%);
    z-index: -1;
    opacity: 15%;
    border-radius: 100000px;
}

.product-pink:hover::before {
    content:"";
    position: absolute;
    inset: 0;
    transform: translate3d(0,0,-1px);
    filter: blur(5px);
    background: linear-gradient(90deg, rgba(255,153,221,1) 0%, rgba(255,153,221,1) 100%);
    z-index: -1;
    opacity: 15%;
    border-radius: 100000px;
}
</style>
