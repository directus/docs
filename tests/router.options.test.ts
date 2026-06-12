// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import routerOptions from '../app/router.options';

describe('router scroll behavior', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="docs-scroll"></div>';
		window.history.pushState({}, '', '/docs/guides/connect/query-parameters#deep');
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('waits for a routed hash target rendered after navigation', async () => {
		const scroller = document.getElementById('docs-scroll') as HTMLElement;
		scroller.scrollTo = vi.fn();

		await routerOptions.scrollBehavior?.(
			{ path: '/guides/connect/query-parameters', hash: '#deep' } as never,
			{ path: '/' } as never,
			null as never,
		);

		expect(scroller.scrollTo).not.toHaveBeenCalled();

		const target = document.createElement('h2');
		target.id = 'deep';
		Object.defineProperty(target, 'offsetTop', { value: 320 });
		scroller.appendChild(target);

		await new Promise(resolve => setTimeout(resolve, 0));

		expect(scroller.scrollTo).toHaveBeenCalledWith({ top: 240, behavior: 'smooth' });
	});

	it('includes sticky subnav height in the hash scroll offset', async () => {
		document.body.innerHTML = '<div id="docs-scroll"><div class="docs-pane" style="--ui-header-height: 64px; --ui-subnav-height: 48px;"></div></div>';
		const scroller = document.getElementById('docs-scroll') as HTMLElement;
		scroller.scrollTo = vi.fn();

		const target = document.createElement('h2');
		target.id = 'deep';
		Object.defineProperty(target, 'offsetTop', { value: 320 });
		scroller.appendChild(target);

		await routerOptions.scrollBehavior?.(
			{ path: '/guides/connect/query-parameters', hash: '#deep' } as never,
			{ path: '/' } as never,
			null as never,
		);

		expect(scroller.scrollTo).toHaveBeenCalledWith({ top: 192, behavior: 'smooth' });
	});
});
