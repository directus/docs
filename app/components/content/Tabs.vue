<script setup>
import {
	TabsContent,
	TabsList,
	TabsRoot,
	TabsTrigger,
} from 'radix-vue';

const slots = useSlots();

const tabs = computed(() =>
	slots.default().map((slot, index) => {
		const label = slot?.props?.filename || slot?.props?.label || slot?.props?.title || `${index}`;
		const icon = slot?.props?.icon || getFileIcon(label) || null;
		const component = slot;

		return {
			label, icon, component,
		};
	}),
);
</script>

<template>
	<TabsRoot
		class="TabsRoot"
		:default-value="`${0}${tabs[0].label}`"
	>
		<TabsList class="TabsList">
			<TabsTrigger
				v-for="({ label, icon }, i) in tabs"
				:key="`${i}${label}trigger`"
				:value="`${i}${label}`"
				class="TabsTrigger"
			>
				<Icon
					v-if="icon"
					:name="icon"
				/>
				{{ label }}
			</TabsTrigger>
		</TabsList>
		<TabsContent
			v-for="({ component, label }, i) in tabs"
			:key="`${i}${label}content`"
			:value="`${i}${label}`"
			class="TabsContent"
		>
			<component :is="component" />
		</TabsContent>
	</TabsRoot>
</template>

<style lang="scss">
    .TabsRoot {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border-2);
        border-radius: var(--border-radius);
        overflow: hidden;
    }

    .TabsList {
        flex-shrink: 0;
        display: flex;
        flex-wrap: wrap;
        position: relative;
        border-bottom: 1px solid var(--border-2);
        background: var(--background--subdued);
        position: relative;
    }

    .TabsTrigger {
        background: none;
        border: none;
        border-bottom: 1px solid var(--border-2);
        margin-bottom: -1px;
        cursor: pointer;
        padding: 0.5rem 0.75rem;
        font-weight: 500;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        &:not(:last-child) {
            border-right: 1px solid var(--border-2);
        }
    }
    .TabsTrigger:hover {
        color: var(--primary);
    }
    .TabsTrigger[data-state="active"] {
        border-bottom-color: var(--primary);
        color: var(--primary);
    }

    .TabsContent {
        flex-grow: 1;
        padding: 1rem;
        outline: none;
        > div > *:first-child {
            margin-top: 0;
        }
        > div > *:last-child {
            margin-bottom: 0;
        }
    }
</style>
