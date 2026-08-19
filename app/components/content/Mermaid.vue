<script setup lang="ts">
import { renderMermaidSVG } from 'beautiful-mermaid';
import {
	Comment,
	Fragment,
	Static,
	Text,
	computed,
	reactive,
	ref,
	useSlots,
	watch,
	type VNode,
} from 'vue';

const props = withDefaults(defineProps<{
	code?: string;
	title?: string;
	filename?: string;
}>(), {
	title: 'Mermaid diagram',
	filename: 'diagram',
});

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.2;
const PAN_STEP = 32;
const INTER_LATIN_RANGE = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const SVG_STYLE_PROPERTIES = [
	'color',
	'display',
	'fill',
	'filter',
	'font-family',
	'font-size',
	'font-style',
	'font-weight',
	'opacity',
	'stroke',
	'stroke-dasharray',
	'stroke-linecap',
	'stroke-linejoin',
	'stroke-width',
	'text-anchor',
	'visibility',
] as const;

const slots = useSlots();
const colorMode = useColorMode();
const scale = ref(1);
const offset = reactive({ x: 0, y: 0 });
const dragging = ref(false);
const exportError = ref('');
const diagramElement = ref<HTMLElement | null>(null);
let dragStart: { pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | null = null;
let embeddedInterCss: Promise<string> | undefined;

function loadEmbeddedInterCss() {
	embeddedInterCss ??= import('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?inline')
		.then(({ default: font }) => `@font-face{font-family:'Inter';src:url('${font}') format('woff2-variations');font-style:normal;font-weight:100 900;font-display:block;unicode-range:${INTER_LATIN_RANGE};}`);
	return embeddedInterCss;
}

function vnodesToText(nodes: unknown): string {
	if (nodes == null || typeof nodes === 'boolean') return '';
	if (typeof nodes === 'string' || typeof nodes === 'number') return String(nodes);
	if (Array.isArray(nodes)) return nodes.map(vnodesToText).join('');

	const node = nodes as VNode;
	if (node.type === Comment) return '';
	if (node.type === Text || node.type === Static) {
		return typeof node.children === 'string' ? node.children : '';
	}
	if (node.type === Fragment) return vnodesToText(node.children);
	if (typeof node.props?.code === 'string') return node.props.code;
	if (Array.isArray(node.children)) return vnodesToText(node.children);
	if (node.children && typeof node.children === 'object' && 'default' in node.children) {
		const fn = (node.children as { default?: () => VNode[] }).default;
		if (typeof fn === 'function') return vnodesToText(fn());
	}
	if (typeof node.children === 'string') return node.children;
	return '';
}

const source = computed(() => props.code?.trim() || vnodesToText(slots.default?.()).trim());

const theme = computed(() => colorMode.value === 'dark'
	? {
			bg: '#090909',
			fg: '#f5f5f5',
			line: '#737373',
			accent: '#9585ff',
			muted: '#a3a3a3',
			surface: '#171717',
			border: '#404040',
		}
	: {
			bg: '#ffffff',
			fg: '#262626',
			line: '#a3a3a3',
			accent: '#6644ff',
			muted: '#737373',
			surface: '#fafafa',
			border: '#d4d4d4',
		});

const renderResult = computed(() => {
	if (!source.value) {
		return { svg: '', error: 'Add Mermaid source code to render a diagram.' };
	}

	try {
		const svg = renderMermaidSVG(source.value, {
			...theme.value,
			font: 'Inter',
			padding: 48,
			interactive: true,
		}).replace(/\s*@import url\([^;]+;\s*/g, '');

		return { svg, error: '' };
	}
	catch (error) {
		return {
			svg: '',
			error: error instanceof Error ? error.message : 'Could not render this Mermaid diagram.',
		};
	}
});

const canvasStyle = computed(() => ({
	transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale.value})`,
}));
const zoomLabel = computed(() => `${Math.round(scale.value * 100)}%`);
const isReset = computed(() => scale.value === 1 && offset.x === 0 && offset.y === 0);

watch(source, resetView);

function setScale(nextScale: number) {
	scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(nextScale.toFixed(1))));
}

function zoomIn() {
	setScale(scale.value + SCALE_STEP);
}

function zoomOut() {
	setScale(scale.value - SCALE_STEP);
}

function resetView() {
	scale.value = 1;
	offset.x = 0;
	offset.y = 0;
}

function startPan(event: PointerEvent) {
	if (event.button !== 0) return;
	event.preventDefault();
	dragging.value = true;
	dragStart = {
		pointerId: event.pointerId,
		x: event.clientX,
		y: event.clientY,
		offsetX: offset.x,
		offsetY: offset.y,
	};
	(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function pan(event: PointerEvent) {
	if (!dragStart || event.pointerId !== dragStart.pointerId) return;
	offset.x = dragStart.offsetX + event.clientX - dragStart.x;
	offset.y = dragStart.offsetY + event.clientY - dragStart.y;
}

function stopPan(event: PointerEvent) {
	if (!dragStart || event.pointerId !== dragStart.pointerId) return;
	dragStart = null;
	dragging.value = false;
}

function handleWheel(event: WheelEvent) {
	if (!event.ctrlKey && !event.metaKey) return;
	event.preventDefault();
	if (event.deltaY < 0) zoomIn();
	else zoomOut();
}

function handleKeydown(event: KeyboardEvent) {
	switch (event.key) {
		case '+':
		case '=':
			event.preventDefault();
			zoomIn();
			break;
		case '-':
			event.preventDefault();
			zoomOut();
			break;
		case '0':
			event.preventDefault();
			resetView();
			break;
		case 'ArrowLeft':
			event.preventDefault();
			offset.x -= PAN_STEP;
			break;
		case 'ArrowRight':
			event.preventDefault();
			offset.x += PAN_STEP;
			break;
		case 'ArrowUp':
			event.preventDefault();
			offset.y -= PAN_STEP;
			break;
		case 'ArrowDown':
			event.preventDefault();
			offset.y += PAN_STEP;
			break;
	}
}

function download(blob: Blob, extension: 'svg' | 'png') {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `${props.filename}.${extension}`;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

function resolvedStyleValue(style: CSSStyleDeclaration, property: string) {
	const value = style.getPropertyValue(property).trim();
	return value && !value.includes('var(') && !value.includes('color-mix(') ? value : '';
}

async function exportSvg() {
	const sourceSvg = diagramElement.value?.querySelector('svg');
	if (!sourceSvg) throw new Error('The diagram is not ready to download.');

	const exportedSvg = sourceSvg.cloneNode(true) as SVGSVGElement;
	const sourceElements = [sourceSvg, ...sourceSvg.querySelectorAll('*')];
	const exportedElements = [exportedSvg, ...exportedSvg.querySelectorAll('*')];

	for (const [index, sourceElement] of sourceElements.entries()) {
		const exportedElement = exportedElements[index] as SVGElement | undefined;
		if (!exportedElement || sourceElement.localName === 'style') continue;
		const computedStyle = getComputedStyle(sourceElement);

		for (const property of SVG_STYLE_PROPERTIES) {
			const value = resolvedStyleValue(computedStyle, property);
			if (value) exportedElement.style.setProperty(property, value);
		}

		for (const attribute of Array.from(exportedElement.attributes)) {
			if (!attribute.value.includes('var(') && !attribute.value.includes('color-mix(')) continue;
			const value = resolvedStyleValue(computedStyle, attribute.name);
			if (value) exportedElement.setAttribute(attribute.name, value);
		}

		for (const property of Array.from(exportedElement.style)) {
			if (property.startsWith('--')) exportedElement.style.removeProperty(property);
		}
	}

	exportedSvg.querySelectorAll('style').forEach(style => style.remove());
	exportedSvg.style.removeProperty('background');
	exportedSvg.style.removeProperty('background-color');
	exportedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

	const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	const { width, height } = svgSize(exportedSvg);
	background.setAttribute('width', String(width));
	background.setAttribute('height', String(height));
	background.setAttribute('fill', theme.value.bg);
	exportedSvg.prepend(background);

	const fontStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style');
	fontStyle.textContent = await loadEmbeddedInterCss();
	exportedSvg.prepend(fontStyle);

	const serialized = new XMLSerializer().serializeToString(exportedSvg);
	if (serialized.includes('var(') || serialized.includes('color-mix(')) {
		throw new Error('The diagram colors could not be serialized for this download.');
	}
	return { svg: serialized, width, height };
}

async function downloadSvg() {
	exportError.value = '';
	try {
		const { svg } = await exportSvg();
		download(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'svg');
	}
	catch (error) {
		exportError.value = error instanceof Error ? error.message : 'The SVG download failed.';
	}
}

function svgSize(svg: Element) {
	const viewBox = svg.getAttribute('viewBox')
		?.split(/[\s,]+/)
		.map(Number);
	const width = viewBox?.[2] || Number.parseFloat(svg.getAttribute('width') || '') || 1200;
	const height = viewBox?.[3] || Number.parseFloat(svg.getAttribute('height') || '') || 800;
	return { width, height };
}

async function downloadPng() {
	exportError.value = '';
	let svgUrl = '';

	try {
		const { svg, width, height } = await exportSvg();
		svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
		const pixelRatio = Math.min(2, 8192 / width, 8192 / height);
		const canvas = window.document.createElement('canvas');
		canvas.width = Math.ceil(width * pixelRatio);
		canvas.height = Math.ceil(height * pixelRatio);
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Canvas export is not supported by this browser.');

		const image = new Image();
		await new Promise<void>((resolve, reject) => {
			image.onload = () => resolve();
			image.onerror = () => reject(new Error('The diagram could not be converted to PNG.'));
			image.src = svgUrl;
		});

		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob((value) => {
				if (value) resolve(value);
				else reject(new Error('The diagram could not be converted to PNG.'));
			}, 'image/png');
		});
		download(blob, 'png');
	}
	catch (error) {
		exportError.value = error instanceof Error ? error.message : 'The PNG download failed.';
	}
	finally {
		if (svgUrl) URL.revokeObjectURL(svgUrl);
	}
}

const downloadItems = [
	{
		label: 'Download PNG',
		icon: 'i-lucide-file-image',
		onSelect: downloadPng,
	},
	{
		label: 'Download SVG',
		icon: 'i-lucide-file-code-2',
		onSelect: downloadSvg,
	},
];
</script>

<template>
	<figure class="not-prose my-6 overflow-hidden rounded-lg border border-default bg-default">
		<figcaption class="flex min-h-11 flex-wrap items-center gap-2 border-b border-default bg-muted/50 px-3 py-2">
			<span class="min-w-0 truncate text-sm font-medium text-highlighted">{{ title }}</span>
			<div class="ms-auto flex items-center gap-1">
				<UTooltip text="Zoom out">
					<UButton
						icon="i-lucide-zoom-out"
						color="neutral"
						variant="ghost"
						size="xs"
						square
						aria-label="Zoom out"
						:disabled="scale <= MIN_SCALE"
						@click="zoomOut"
					/>
				</UTooltip>
				<output
					class="w-11 text-center text-xs tabular-nums text-muted"
					aria-live="polite"
				>{{ zoomLabel }}</output>
				<UTooltip text="Zoom in">
					<UButton
						icon="i-lucide-zoom-in"
						color="neutral"
						variant="ghost"
						size="xs"
						square
						aria-label="Zoom in"
						:disabled="scale >= MAX_SCALE"
						@click="zoomIn"
					/>
				</UTooltip>
				<UTooltip text="Reset view">
					<UButton
						icon="i-lucide-scan"
						color="neutral"
						variant="ghost"
						size="xs"
						square
						aria-label="Reset view"
						:disabled="isReset"
						@click="resetView"
					/>
				</UTooltip>
				<span class="mx-1 h-5 border-s border-default" />
				<UDropdownMenu
					:items="downloadItems"
					:content="{ side: 'bottom', align: 'end' }"
				>
					<UTooltip text="Download diagram">
						<UButton
							icon="i-lucide-download"
							color="neutral"
							variant="ghost"
							size="xs"
							square
							aria-label="Download diagram"
							:disabled="!renderResult.svg"
						/>
					</UTooltip>
				</UDropdownMenu>
			</div>
		</figcaption>

		<div
			v-if="renderResult.error"
			class="flex min-h-48 items-center justify-center p-6 text-sm text-error"
			role="alert"
		>
			{{ renderResult.error }}
		</div>
		<div
			v-else
			class="relative min-h-80 touch-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
			role="group"
			:aria-label="`${title}. Use arrow keys to pan, plus and minus to zoom, and zero to reset.`"
			tabindex="0"
			:class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
			@pointerdown="startPan"
			@pointermove="pan"
			@pointerup="stopPan"
			@pointercancel="stopPan"
			@wheel="handleWheel"
			@keydown="handleKeydown"
		>
			<!-- beautiful-mermaid escapes labels before returning this SVG. -->
			<!-- eslint-disable vue/no-v-html -->
			<div
				ref="diagramElement"
				class="mermaid-canvas grid min-h-80 min-w-full place-items-center p-6 will-change-transform"
				:class="{ 'transition-transform duration-150 ease-out': !dragging }"
				:style="canvasStyle"
				v-html="renderResult.svg"
			/>
			<!-- eslint-enable vue/no-v-html -->
		</div>

		<p
			v-if="exportError"
			class="border-t border-default px-3 py-2 text-xs text-error"
			role="alert"
		>
			{{ exportError }}
		</p>
	</figure>
</template>

<style scoped>
.mermaid-canvas :deep(svg) {
	display: block;
	max-width: 100%;
	height: auto;
	user-select: none;
}
</style>
