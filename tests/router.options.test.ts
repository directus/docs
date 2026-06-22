// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import routerOptions, { scrollToHashWhenReady } from '../app/router.options';

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

		scrollToHashWhenReady('#deep');

		const target = document.createElement('h2');
		target.id = 'deep';
		target.scrollIntoView = vi.fn();
		scroller.appendChild(target);

		await new Promise(resolve => setTimeout(resolve, 0));

		expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
	});

	it('uses native hash scrolling so heading scroll margin applies', async () => {
		document.body.innerHTML = '<div id="docs-scroll"><div class="docs-pane" style="--ui-header-height: 64px; --ui-subnav-height: 48px;"></div></div>';
		const scroller = document.getElementById('docs-scroll') as HTMLElement;

		const target = document.createElement('h2');
		target.id = 'deep';
		target.scrollIntoView = vi.fn();
		scroller.appendChild(target);

		await routerOptions.scrollBehavior?.(
			{ path: '/guides/connect/query-parameters', hash: '#deep' } as never,
			{ path: '/' } as never,
			null as never,
		);

		expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
	});
});
