<script setup lang="ts">
const calloutDefinitions = {
	'info': {
		icon: 'material-symbols:info-outline',
		color: null,
	},
	'link': {
		icon: 'material-symbols:link',
		color: null,
	},
	'warning': {
		icon: 'material-symbols:warning-rounded',
		color: 'var(--red)',
	},
	'dev-docs': {
		icon: 'material-symbols:menu-book-outline',
		color: 'var(--area--dev-docs)',
	},
	'cloud': {
		icon: 'material-symbols:cloud',
		color: 'var(--area--cloud)',
	},
	'api-reference': {
		icon: 'material-symbols:code-blocks-rounded',
		color: 'var(--area--api-reference)',
	},
	'tutorials': {
		icon: 'material-symbols:school-outline',
		color: 'var(--area--tutorials)',
	},
	'community': {
		icon: 'material-symbols:groups',
		color: 'var(--area--community)',
	},
} as const;

const props = withDefaults(
	defineProps<{
		title?: string;
		url?: string;
		toggleable?: boolean;
		type?: keyof typeof calloutDefinitions;
	}>(),
	{
		type: 'info',
	},
);
const section = calloutDefinitions[props.type];

function componentType() {
	if (props.url && props.url.charAt(0) == '/')
		return resolveComponent('NuxtLink');
	if (props.url) return 'a';
	else return 'div';
}

const detailsOpen = ref(false);
</script>

<template>
	<!-- TOGGLE -->
	<details
		v-if="toggleable"
		class="callout info"
		@toggle="detailsOpen = !detailsOpen"
	>
		<summary>
			<span> {{ title }} </span>
			<!-- <Badge small :text="`Click to ${detailsOpen ? 'close' : 'open'}`" /> -->
			<Icon
				name="material-symbols:keyboard-arrow-down-rounded"
				:class="{ toggle: true, open: detailsOpen }"
			/>
		</summary>
		<div class="content">
			<ContentSlot :use="$slots.default" />
		</div>
	</details>

	<!-- STATIC -->
	<component
		:is="componentType()"
		v-else
		:href="url"
		class="callout"
		:class="type"
		:style="section.color ? `--callout-color: ${section.color}` : ''"
	>
		<Icon
			:name="section.icon"
			:color="section.color"
			class="icon main"
		/>
		<div class="content">
			<p
				v-if="title"
				class="title"
			>
				<b>{{ title }}</b>
			</p>
			<ContentSlot :use="$slots.default" />
		</div>
		<!-- @vue-expect-error -->
		<Icon
			v-if="componentType == 'a' || componentType().name == 'NuxtLink'"
			class="arrow"
			name="material-symbols:arrow-forward-ios-rounded"
			:color="section.color"
		/>
	</component>
</template>

<style scoped lang="scss">
.dark {
	.callout.warning {
		background-color: color-mix(
			in hsl shorter hue,
			rgba(0, 0, 0, 0.1) 75%,
			var(--red-6) 25%
		);
		border-color: color-mix(
			in hsl shorter hue,
			rgba(0, 0, 0, 0) 60%,
			var(--red-6) 40%
		);
	}
}
.callout {
	display: block;
	background: var(--background-subdued);
	border: 1px solid var(--border-subdued);
	padding: 1rem;
	border-radius: var(--border-radius);
	text-decoration: none;
	color: inherit;
	display: grid;
	grid-template-columns: 2em auto;
	&.warning {
		background: var(--red-1);
		border-color: var(--red-2);
	}

	&:after {
		display: none !important;
	}
}

a.callout {
	background: transparent;
	grid-template-columns: 2em auto 2em;
	transition: border 0.1s ease, box-shadow 0.1s ease, color 0.1s ease;
	&:hover {
		border-style: solid;
		cursor: pointer;
		border: 1px solid var(--callout-color, var(--primary));
		box-shadow: 0 0 0.5rem 0 color-mix(in srgb, var(--callout-color, var(--primary)) 15%, transparent);
	}
	.arrow {
		margin-left: auto;
		margin-top: 5px;
	}
}

.icon.main {
	margin-top: 7px;
}

details.callout {
	summary {
		line-height: 1;
		cursor: pointer;
		font-weight: bold;
		display: flex;
		justify-content: space-between;
		align-items: center;
		svg.icon {
			margin-bottom: 0;
		}
		&::marker {
			content: "";
		}
		&:deep(+ *) {
			margin-top: 1rem;
		}
	}
	.toggle {
		&.open {
			transform: rotate(180deg);
		}
	}
}

.content {
	width: 100%;
	line-height: 1.9;
	:deep(p) {
		margin-bottom: 0.5rem;
	}

	:deep(> *:last-child) {
		margin-bottom: 0;
	}

	:deep(ul),
	:deep(ol) {
		padding-left: 1.25rem;
	}
}
</style>
