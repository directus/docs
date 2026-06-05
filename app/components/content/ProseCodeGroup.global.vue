<script lang="ts">
import UiProseCodeGroup from '@nuxt/ui/components/prose/CodeGroup.vue';
import { cloneVNode, defineComponent, Fragment, h, type VNode } from 'vue';
import { getLibraryByLabel } from '~/utils/libraries';

function withIcons(nodes: VNode[]): VNode[] {
	return nodes.flatMap((node) => {
		if (node.type === Fragment && Array.isArray(node.children)) {
			return [h(Fragment, null, withIcons(node.children as VNode[]))];
		}

		const props = (node.props ?? {}) as Record<string, unknown>;
		const label = props.filename || props.label;

		if (label && !props.icon) {
			const icon = getLibraryByLabel(String(label))?.icon;
			if (icon) return [cloneVNode(node, { icon })];
		}

		return [node];
	});
}

function tabRank(node: VNode): number {
	const props = (node.props ?? {}) as Record<string, unknown>;
	const label = String(props.filename || props.label || '').toLowerCase();
	if (label === 'sdk') return 0;
	if (label === 'graphql') return 2;
	return 1;
}

function sortTabs(nodes: VNode[]): VNode[] {
	const flat = nodes.flatMap(node =>
		node.type === Fragment && Array.isArray(node.children)
			? (node.children as VNode[])
			: [node],
	);
	return [...flat].sort((a, b) => tabRank(a) - tabRank(b));
}

export default defineComponent({
	name: 'ProseCodeGroup',
	inheritAttrs: false,
	setup(_, { slots, attrs }) {
		return () => h(UiProseCodeGroup, attrs, {
			default: () => sortTabs(withIcons(slots.default?.() ?? [])),
		});
	},
});
</script>
