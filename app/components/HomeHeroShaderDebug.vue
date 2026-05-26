<script setup lang="ts">
const strength = defineModel<number>('strength', { required: true });
const strokeSize = defineModel<number>('strokeSize', { required: true });
const hoverRadius = defineModel<number>('hoverRadius', { required: true });
const baseColor = defineModel<string>('baseColor', { required: true });
const washAmount = defineModel<number>('washAmount', { required: true });
const breathe = defineModel<number>('breathe', { required: true });
const phase = defineModel<number>('phase', { required: true });
const tempSway = defineModel<number>('tempSway', { required: true });

const panelOpen = ref(false);
</script>

<template>
	<div
		class="shader-debug"
		:class="{ 'shader-debug-collapsed': !panelOpen }"
	>
		<button
			type="button"
			class="shader-debug-toggle"
			@click="panelOpen = !panelOpen"
		>
			{{ panelOpen ? '▾' : '▸' }} shader
		</button>
		<div
			v-if="panelOpen"
			class="shader-debug-body"
		>
			<label>
				<span>strokeSize {{ strokeSize }}</span>
				<input
					v-model.number="strokeSize"
					type="range"
					min="1"
					max="12"
					step="1"
				>
			</label>
			<label>
				<span>strength (contrast) {{ strength.toFixed(2) }}</span>
				<input
					v-model.number="strength"
					type="range"
					min="0"
					max="1"
					step="0.01"
				>
			</label>
			<label>
				<span>hoverRadius {{ hoverRadius.toFixed(2) }}</span>
				<input
					v-model.number="hoverRadius"
					type="range"
					min="0.05"
					max="0.8"
					step="0.01"
				>
			</label>
			<label>
				<span>washAmount (base ↔ image) {{ washAmount.toFixed(2) }}</span>
				<input
					v-model.number="washAmount"
					type="range"
					min="0"
					max="1"
					step="0.01"
				>
			</label>
			<label>
				<span>breathe (stroke swell) {{ breathe.toFixed(2) }}</span>
				<input
					v-model.number="breathe"
					type="range"
					min="0"
					max="1"
					step="0.01"
				>
			</label>
			<label>
				<span>phase (per-region offset) {{ phase.toFixed(2) }}</span>
				<input
					v-model.number="phase"
					type="range"
					min="0"
					max="1"
					step="0.01"
				>
			</label>
			<label>
				<span>tempSway (warm/cool cycle) {{ tempSway.toFixed(2) }}</span>
				<input
					v-model.number="tempSway"
					type="range"
					min="0"
					max="1"
					step="0.01"
				>
			</label>
			<label class="shader-debug-color">
				<span>base {{ baseColor }}</span>
				<span class="shader-debug-color-row">
					<input
						v-model="baseColor"
						type="color"
					>
					<input
						v-model="baseColor"
						type="text"
						spellcheck="false"
					>
				</span>
			</label>
		</div>
	</div>
</template>

<style scoped>
.shader-debug {
	position: absolute;
	top: 0.75rem;
	right: 0.75rem;
	z-index: 20;
	font-family: var(--font-mono, monospace);
	font-size: 0.6875rem;
	color: rgba(255, 255, 255, 0.85);
	background: rgba(10, 10, 20, 0.78);
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: 0.5rem;
	backdrop-filter: blur(8px);
	min-width: 13rem;
	pointer-events: auto;
}
.shader-debug-collapsed { min-width: 0; }
.shader-debug-toggle { white-space: nowrap; }
.shader-debug-toggle {
	display: block;
	width: 100%;
	padding: 0.375rem 0.625rem;
	background: transparent;
	border: 0;
	color: inherit;
	font: inherit;
	text-align: left;
	cursor: pointer;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.shader-debug-collapsed .shader-debug-toggle { border-bottom: 0; }
.shader-debug-body {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 0.625rem;
}
.shader-debug-body label {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}
.shader-debug-body span {
	color: rgba(255, 255, 255, 0.6);
}
.shader-debug-body input[type="range"],
.shader-debug-body select {
	width: 100%;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.1);
	color: white;
	border-radius: 0.25rem;
	padding: 0.125rem 0.25rem;
	font: inherit;
}
.shader-debug-color-row {
	display: flex;
	gap: 0.375rem;
	align-items: center;
}
.shader-debug-color-row input[type="color"] {
	width: 1.75rem;
	height: 1.5rem;
	padding: 0;
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 0.25rem;
	cursor: pointer;
}
.shader-debug-color-row input[type="text"] {
	flex: 1;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.1);
	color: white;
	border-radius: 0.25rem;
	padding: 0.125rem 0.375rem;
	font: inherit;
}
</style>
