/**
 * Safe-triangle hover intent guard.
 *
 * Inspired by @floating-ui/react's safePolygon (MIT) and Amazon's mega-menu
 * pattern. Our case is simpler: trigger (results list) is always to the LEFT
 * of the floating pane (preview), so the safe area is a triangle from the
 * cursor's exit point to the floating pane's two left corners.
 *
 * Usage: pass `trigger` (results container) and `floating` (preview pane) refs.
 * Call `onPointerMove(event)` from a pointermove listener that covers both
 * elements and the gap between them. While the cursor is inside the triangle,
 * `isGuarding()` returns true — use that to swallow hover-driven highlight
 * events on intermediate rows.
 */

type Point = [number, number];

export interface SafePolygonOptions {
	/** Pixel buffer around the polygon edges. Default 0.5 (matches Floating UI). */
	buffer?: number;
	/** Require sustained cursor motion toward the floating element. Default true. */
	requireIntent?: boolean;
}

export interface SafePolygon {
	/** Call from pointermove on the trigger element. Returns true if cursor is inside the safe polygon. */
	onPointerMove: (event: PointerEvent | MouseEvent) => boolean;
	/** True while a recent pointer motion is still inside the polygon. */
	isGuarding: () => boolean;
	/** Reset state — call when the floating target changes (e.g. results list rebuilds). */
	reset: () => void;
}

function isPointInPolygon(point: Point, polygon: Point[]) {
	const [x, y] = point;
	let isInside = false;
	const length = polygon.length;
	for (let i = 0, j = length - 1; i < length; j = i++) {
		const [xi, yi] = polygon[i] || [0, 0];
		const [xj, yj] = polygon[j] || [0, 0];
		const intersect = yi >= y !== yj >= y && x <= ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) isInside = !isInside;
	}
	return isInside;
}

export function createSafePolygon(
	getTrigger: () => HTMLElement | null,
	getFloating: () => HTMLElement | null,
	options: SafePolygonOptions = {},
): SafePolygon {
	const { buffer = 0.5, requireIntent = true } = options;

	let anchorX: number | null = null;
	let anchorY: number | null = null;
	let lastX: number | null = null;
	let lastY: number | null = null;
	let prevX: number | null = null;
	let lastTime = 0;
	let guarding = false;

	function getCursorSpeed(x: number, y: number): number | null {
		const now = performance.now();
		const elapsed = now - lastTime;
		if (lastX === null || lastY === null || elapsed === 0) {
			lastX = x;
			lastY = y;
			lastTime = now;
			return null;
		}
		const dx = x - lastX;
		const dy = y - lastY;
		const speed = Math.sqrt(dx * dx + dy * dy) / elapsed;
		lastX = x;
		lastY = y;
		lastTime = now;
		return speed;
	}

	function reset() {
		anchorX = null;
		anchorY = null;
		lastX = null;
		lastY = null;
		prevX = null;
		lastTime = 0;
		guarding = false;
	}

	function onPointerMove(event: PointerEvent | MouseEvent): boolean {
		const trigger = getTrigger();
		const floating = getFloating();
		if (!trigger || !floating) {
			guarding = false;
			return false;
		}

		const { clientX, clientY } = event;
		const triggerRect = trigger.getBoundingClientRect();
		const floatingRect = floating.getBoundingClientRect();

		const insideTrigger
			= clientX >= triggerRect.left
			&& clientX <= triggerRect.right
			&& clientY >= triggerRect.top
			&& clientY <= triggerRect.bottom;

		// Anchor = cursor position when the user begins moving toward the
		// floating pane. Update anchor while cursor is NOT moving rightward
		// (toward the pane). Once the cursor commits to a rightward move,
		// freeze the anchor so the triangle has a real apex behind the cursor.
		if (insideTrigger) {
			const movingTowardFloating = prevX !== null && clientX > prevX;
			if (!movingTowardFloating || anchorX === null) {
				anchorX = clientX;
				anchorY = clientY;
			}
		}
		prevX = clientX;

		if (anchorX === null || anchorY === null) {
			guarding = false;
			return false;
		}

		// Triangle from anchor → top-left and bottom-left corners of floating.
		// Buffer pulls the floating-side edge inward by a hair so the triangle
		// doesn't render flush against the pane border.
		const polygon: Point[] = [
			[anchorX, anchorY],
			[floatingRect.left + buffer, floatingRect.top],
			[floatingRect.left + buffer, floatingRect.bottom],
		];

		// Trough between trigger right edge and floating left edge: any cursor
		// inside this strip should be guarded regardless of triangle math.
		const top = Math.min(triggerRect.top, floatingRect.top);
		const bottom = Math.max(triggerRect.bottom, floatingRect.bottom);
		const rectPoly: Point[] = [
			[triggerRect.right - 1, bottom],
			[triggerRect.right - 1, top],
			[floatingRect.left + 1, top],
			[floatingRect.left + 1, bottom],
		];

		const insideTrough = isPointInPolygon([clientX, clientY], rectPoly);
		const insidePolygon = isPointInPolygon([clientX, clientY], polygon);

		if (insideTrough) {
			guarding = true;
			return true;
		}

		// Cursor crossed the floating pane's left edge → no longer guarding.
		if (clientX >= floatingRect.left + 1) {
			guarding = false;
			return false;
		}

		// Intent check: if the cursor stalls (slow motion) outside the trigger,
		// drop the guard so hover responds normally.
		if (requireIntent && !insideTrigger) {
			const speed = getCursorSpeed(clientX, clientY);
			if (speed !== null && speed < 0.1) {
				guarding = false;
				return false;
			}
		}

		guarding = insidePolygon;
		return insidePolygon;
	}

	return {
		onPointerMove,
		isGuarding: () => guarding,
		reset,
	};
}
