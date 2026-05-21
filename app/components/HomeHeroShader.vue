<script setup lang="ts">
const props = withDefaults(defineProps<{
	src?: string;
	pixelSize?: number;
	hoverRadius?: number;
	driftSpeed?: number;
	strength?: number;
	baseColor?: string;
	tintColor?: string;
	tintAmount?: number;
	anchorX?: number;
	anchorY?: number;
}>(), {
	src: '/img/mountains.avif',
	pixelSize: 2,
	hoverRadius: 0.3,
	driftSpeed: 0.12,
	strength: 1,
	baseColor: '#0a0f21',
	tintColor: '#6644ff',
	tintAmount: 0.45,
	anchorX: 0.5,
	anchorY: 1,
});

const isDev = import.meta.dev;

const settings = reactive({
	pixelSize: props.pixelSize,
	hoverRadius: props.hoverRadius,
	driftSpeed: props.driftSpeed,
	strength: props.strength,
	baseColor: props.baseColor,
	tintColor: props.tintColor,
	tintAmount: props.tintAmount,
	anchorX: props.anchorX,
	anchorY: props.anchorY,
});
const shaderFailed = ref(false);
const imageLoaded = ref(false);
const imageSize = ref<[number, number]>([0, 0]);
const baseRgb = ref<[number, number, number]>([0.04, 0.06, 0.13]);
const tintRgb = ref<[number, number, number]>([0.4, 0.267, 1.0]);

function parseColor(input: string): [number, number, number] | null {
	if (!input) return null;
	const s = input.trim();
	const hexMatch = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
	if (hexMatch) {
		let h = hexMatch[1]!;
		if (h.length === 3) h = h.split('').map(c => c + c).join('');
		const n = parseInt(h, 16);
		return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
	}
	const rgbMatch = s.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
	if (rgbMatch) {
		return [parseFloat(rgbMatch[1]!) / 255, parseFloat(rgbMatch[2]!) / 255, parseFloat(rgbMatch[3]!) / 255];
	}
	return null;
}

function readColors() {
	if (!container.value) return;
	const cs = getComputedStyle(container.value);
	const base = parseColor(settings.baseColor) ?? parseColor(cs.getPropertyValue('--hero-shader-base'));
	const tint = parseColor(settings.tintColor) ?? parseColor(cs.getPropertyValue('--hero-shader-tint'));
	if (base) baseRgb.value = base;
	if (tint) tintRgb.value = tint;
}

const canvas = ref<HTMLCanvasElement | null>(null);
const container = ref<HTMLDivElement | null>(null);

let gl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let imgTex: WebGLTexture | null = null;
let raf = 0;
let ro: ResizeObserver | null = null;
let hoverTarget: HTMLElement | null = null;

const mouse = { x: 0.5, y: 0.5, hover: 0, target: 0 };
const startTime = typeof performance !== 'undefined' ? performance.now() : 0;

let reducedMotion = false;
let mql: MediaQueryList | null = null;
function onReducedMotionChange(e: MediaQueryListEvent | MediaQueryList) {
	reducedMotion = e.matches;
	if (gl) requestRender();
}

const vertSrc = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
	v_uv = a_pos * 0.5 + 0.5;
	gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const fragSrc = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform vec2 u_imgSize;
uniform vec2 u_mouse;
uniform float u_hover;
uniform float u_pixelSize;
uniform float u_hoverRadius;
uniform float u_time;
uniform float u_driftSpeed;
uniform float u_aspect;
uniform float u_strength;
uniform float u_reducedMotion;
uniform vec3 u_base;
uniform vec3 u_tint;
uniform float u_tintAmount;
uniform vec2 u_anchor;

float bayer4(vec2 p) {
	int x = int(mod(p.x, 4.0));
	int y = int(mod(p.y, 4.0));
	int idx = x + y * 4;
	if (idx == 0) return 0.0/16.0;
	if (idx == 1) return 8.0/16.0;
	if (idx == 2) return 2.0/16.0;
	if (idx == 3) return 10.0/16.0;
	if (idx == 4) return 12.0/16.0;
	if (idx == 5) return 4.0/16.0;
	if (idx == 6) return 14.0/16.0;
	if (idx == 7) return 6.0/16.0;
	if (idx == 8) return 3.0/16.0;
	if (idx == 9) return 11.0/16.0;
	if (idx == 10) return 1.0/16.0;
	if (idx == 11) return 9.0/16.0;
	if (idx == 12) return 15.0/16.0;
	if (idx == 13) return 7.0/16.0;
	if (idx == 14) return 5.0/16.0;
	return 13.0/16.0;
}

vec2 coverUv(vec2 uv, vec2 res, vec2 img, vec2 anchor) {
	float ra = res.x / res.y;
	float ia = img.x / img.y;
	vec2 scale = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
	vec2 centered = (uv - 0.5) * scale + 0.5;
	vec2 maxOffset = (1.0 - scale) * 0.5;
	return centered + maxOffset * (anchor * 2.0 - 1.0);
}

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
	vec2 frag = v_uv * u_resolution;
	float px = u_pixelSize;

	float motion = 1.0 - u_reducedMotion;

	vec2 fromMouseUv = (v_uv - u_mouse) * vec2(u_aspect, 1.0);
	float dCursor = length(fromMouseUv) / u_hoverRadius;
	float cursorMask = exp(-dCursor * dCursor * 1.8) * u_hover * motion;

	vec2 cell = floor(frag / px);
	float seed = hash(cell);
	float wobble = (sin(u_time * u_driftSpeed + seed * 6.2831) * 0.5 + 0.5) * motion + 0.5 * (1.0 - motion);

	vec2 drift = vec2(
		sin(u_time * u_driftSpeed * 0.7) * px * 0.5,
		cos(u_time * u_driftSpeed * 0.5) * px * 0.5
	) * motion;

	vec2 pixelated = cell * px + px * 0.5 + drift;
	vec2 uvSampled = pixelated / u_resolution;
	vec2 sampleUv = coverUv(uvSampled, u_resolution, u_imgSize, u_anchor);
	vec3 col = texture2D(u_tex, sampleUv).rgb;

	float lumIn = dot(col, vec3(0.299, 0.587, 0.114));
	float lumBoost = lumIn + (wobble - 0.5) * 0.04;

	float threshold = bayer4(pixelated / px) - 0.5;

	float ambientLevels = mix(8.0, 5.0, u_strength);
	float cursorLevels = mix(ambientLevels, 3.0, cursorMask);
	float levels = cursorLevels;

	float qLum = clamp(floor(lumBoost * levels + threshold) / (levels - 1.0), 0.0, 1.0);

	vec3 ditheredImg = col * qLum;
	vec3 paletteCol = mix(u_base, u_tint, qLum);
	vec3 finalCol = mix(ditheredImg, paletteCol, u_tintAmount);

	float vig = smoothstep(1.1, 0.4, length(v_uv - 0.5));
	finalCol *= mix(0.55, 1.0, vig);

	gl_FragColor = vec4(finalCol, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
	const sh = gl.createShader(type);
	if (!sh) return null;
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		console.error('Shader compile failed:', gl.getShaderInfoLog(sh));
		gl.deleteShader(sh);
		return null;
	}
	return sh;
}

function loadImage() {
	if (!gl || !imgTex) return;
	const src = props.src;
	imageLoaded.value = false;
	shaderFailed.value = false;

	const img = new Image();
	img.crossOrigin = 'anonymous';
	img.onload = () => {
		if (!gl || !imgTex || src !== props.src) return;
		gl.bindTexture(gl.TEXTURE_2D, imgTex);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		imageSize.value = [img.naturalWidth, img.naturalHeight];
		imageLoaded.value = true;
		requestRender();
	};
	img.onerror = () => {
		if (src === props.src) shaderFailed.value = true;
	};
	img.src = src;
}

function init() {
	if (!canvas.value || !container.value) return;
	gl = canvas.value.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
	if (!gl) {
		shaderFailed.value = true;
		return;
	}

	const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
	const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
	program = gl.createProgram();
	if (!vs || !fs || !program) {
		shaderFailed.value = true;
		return;
	}
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Shader link failed:', gl.getProgramInfoLog(program));
		shaderFailed.value = true;
		return;
	}
	gl.useProgram(program);

	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
	const loc = gl.getAttribLocation(program, 'a_pos');
	gl.enableVertexAttribArray(loc);
	gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

	imgTex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, imgTex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 20, 40, 255]));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	readColors();
	syncCanvasSize();
	ro = new ResizeObserver(resize);
	ro.observe(container.value);
	const parent = container.value.parentElement;
	if (parent) ro.observe(parent);
	window.addEventListener('resize', resize);
	loadImage();
}

watch(() => [props.pixelSize, props.hoverRadius, props.driftSpeed, props.strength, props.baseColor, props.tintColor, props.tintAmount, props.anchorX, props.anchorY], () => {
	settings.pixelSize = props.pixelSize;
	settings.hoverRadius = props.hoverRadius;
	settings.driftSpeed = props.driftSpeed;
	settings.strength = props.strength;
	settings.baseColor = props.baseColor;
	settings.tintColor = props.tintColor;
	settings.tintAmount = props.tintAmount;
	settings.anchorX = props.anchorX;
	settings.anchorY = props.anchorY;
});

watch(() => props.src, () => loadImage());

watch(() => [settings.pixelSize, settings.hoverRadius, settings.driftSpeed, settings.strength, settings.baseColor, settings.tintColor, settings.tintAmount, settings.anchorX, settings.anchorY], () => {
	readColors();
	if (gl) requestRender();
});

function syncCanvasSize() {
	if (!canvas.value || !container.value || !gl) return false;
	const rect = container.value.getBoundingClientRect();
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const w = Math.max(1, Math.floor(rect.width * dpr));
	const h = Math.max(1, Math.floor(rect.height * dpr));
	const changed = canvas.value.width !== w || canvas.value.height !== h;
	if (!changed) return false;
	canvas.value.width = w;
	canvas.value.height = h;
	canvas.value.style.width = rect.width + 'px';
	canvas.value.style.height = rect.height + 'px';
	gl.viewport(0, 0, w, h);
	return true;
}

function resize() {
	const changed = syncCanvasSize();
	if (changed && imageLoaded.value) requestRender();
}

function render() {
	if (!gl || !program || !canvas.value || !imageLoaded.value) return;
	syncCanvasSize();

	if (reducedMotion) {
		mouse.hover = 0;
	}
	else {
		mouse.hover += (mouse.target - mouse.hover) * 0.08;
	}

	const t = reducedMotion ? 0 : (performance.now() - startTime) / 1000;
	const w = canvas.value.width;
	const h = canvas.value.height;
	const imgW = imageSize.value[0] || w;
	const imgH = imageSize.value[1] || h;

	gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), w, h);
	gl.uniform2f(gl.getUniformLocation(program, 'u_imgSize'), imgW, imgH);
	gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouse.x, mouse.y);
	gl.uniform1f(gl.getUniformLocation(program, 'u_hover'), mouse.hover);
	gl.uniform1f(gl.getUniformLocation(program, 'u_pixelSize'), Math.max(1, Number(settings.pixelSize) || 1) * (window.devicePixelRatio || 1));
	gl.uniform1f(gl.getUniformLocation(program, 'u_hoverRadius'), settings.hoverRadius);
	gl.uniform1f(gl.getUniformLocation(program, 'u_time'), t);
	gl.uniform1f(gl.getUniformLocation(program, 'u_driftSpeed'), settings.driftSpeed);
	gl.uniform1f(gl.getUniformLocation(program, 'u_aspect'), w / h);
	gl.uniform1f(gl.getUniformLocation(program, 'u_strength'), settings.strength);
	gl.uniform1f(gl.getUniformLocation(program, 'u_reducedMotion'), reducedMotion ? 1 : 0);
	gl.uniform3f(gl.getUniformLocation(program, 'u_base'), baseRgb.value[0], baseRgb.value[1], baseRgb.value[2]);
	gl.uniform3f(gl.getUniformLocation(program, 'u_tint'), tintRgb.value[0], tintRgb.value[1], tintRgb.value[2]);
	gl.uniform1f(gl.getUniformLocation(program, 'u_tintAmount'), settings.tintAmount);
	gl.uniform2f(gl.getUniformLocation(program, 'u_anchor'), settings.anchorX, settings.anchorY);
	gl.uniform1i(gl.getUniformLocation(program, 'u_tex'), 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, imgTex);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	if (!reducedMotion) raf = requestAnimationFrame(render);
}

function requestRender() {
	if (raf) cancelAnimationFrame(raf);
	raf = requestAnimationFrame(render);
}

function onMove(e: PointerEvent) {
	if (!container.value) return;

	const isOverDebug = e.composedPath().some((target) => {
		return target instanceof HTMLElement && target.closest('.shader-debug');
	});
	if (isOverDebug) return;

	const rect = container.value.getBoundingClientRect();
	mouse.x = (e.clientX - rect.left) / rect.width;
	mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
	mouse.target = 1;
}
function onLeave() {
	mouse.target = 0;
}

onMounted(() => {
	if (typeof window !== 'undefined' && window.matchMedia) {
		mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mql.matches;
		mql.addEventListener('change', onReducedMotionChange);
	}
	init();
	hoverTarget = container.value?.parentElement ?? container.value;
	if (hoverTarget) {
		hoverTarget.addEventListener('pointermove', onMove);
		hoverTarget.addEventListener('pointerleave', onLeave);
	}
});

onBeforeUnmount(() => {
	cancelAnimationFrame(raf);
	ro?.disconnect();
	window.removeEventListener('resize', resize);
	mql?.removeEventListener('change', onReducedMotionChange);
	if (hoverTarget) {
		hoverTarget.removeEventListener('pointermove', onMove);
		hoverTarget.removeEventListener('pointerleave', onLeave);
	}
	if (gl) {
		if (imgTex) gl.deleteTexture(imgTex);
		if (program) gl.deleteProgram(program);
	}
});
</script>

<template>
	<div
		ref="container"
		class="hero-shader"
	>
		<div
			v-if="shaderFailed"
			class="hero-shader-fallback"
			:style="{ backgroundImage: `url(${props.src})` }"
		/>
		<canvas
			v-show="!shaderFailed"
			ref="canvas"
			class="hero-shader-canvas"
		/>
		<HomeHeroShaderDebug
			v-if="isDev"
			v-model:strength="settings.strength"
			v-model:pixel-size="settings.pixelSize"
			v-model:hover-radius="settings.hoverRadius"
			v-model:drift-speed="settings.driftSpeed"
			v-model:tint-color="settings.tintColor"
			v-model:base-color="settings.baseColor"
			v-model:tint-amount="settings.tintAmount"
		/>
	</div>
</template>

<style scoped>
.hero-shader {
	position: absolute;
	inset: 0;
	overflow: hidden;
	border-radius: inherit;
	pointer-events: none;
}
.hero-shader-fallback,
.hero-shader-canvas {
	position: absolute;
	inset: 0;
	display: block;
	width: 100%;
	height: 100%;
}
.hero-shader-fallback {
	background-position: center bottom;
	background-size: cover;
}
</style>
