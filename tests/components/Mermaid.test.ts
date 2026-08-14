import { h, nextTick } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import Mermaid from '../../app/components/content/Mermaid.vue';

mockNuxtImport('useColorMode', () => () => ({ value: 'light' }));

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

const diagram = `flowchart LR
  Client --> Directus`;
const tooltipStub = { template: '<span v-bind="$attrs"><slot /></span>' };

describe('Mermaid', () => {
	it('renders Mermaid source passed as a prop', async () => {
		const wrapper = await mountSuspended(Mermaid, {
			props: { code: diagram, title: 'Request flow' },
			global: { stubs: { UTooltip: tooltipStub } },
		});

		expect(wrapper.text()).toContain('Request flow');
		expect(wrapper.find('.mermaid-canvas svg').exists()).toBe(true);
		expect(wrapper.find('.mermaid-canvas').html()).not.toContain('@import url');
	});

	it('reads source from an MDC code block slot', async () => {
		const wrapper = await mountSuspended(Mermaid, {
			slots: {
				default: () => h('pre', { code: diagram }, [h('code', diagram)]),
			},
			global: { stubs: { UTooltip: tooltipStub } },
		});

		expect(wrapper.find('.mermaid-canvas svg').exists()).toBe(true);
	});

	it('zooms, pans with the keyboard, and resets', async () => {
		const wrapper = await mountSuspended(Mermaid, {
			props: { code: diagram },
			global: { stubs: { UTooltip: tooltipStub } },
		});

		await wrapper.get('[aria-label="Zoom in"]').trigger('click');
		expect(wrapper.get('.mermaid-canvas').attributes('style')).toContain('scale(1.2)');

		await wrapper.get('[role="group"]').trigger('keydown', { key: 'ArrowRight' });
		expect(wrapper.get('.mermaid-canvas').attributes('style')).toContain('translate3d(32px, 0px, 0)');

		await wrapper.get('[aria-label="Reset view"]').trigger('click');
		await nextTick();
		expect(wrapper.get('.mermaid-canvas').attributes('style')).toContain('translate3d(0px, 0px, 0) scale(1)');
	});

	it('shows renderer errors without breaking the page', async () => {
		const wrapper = await mountSuspended(Mermaid, {
			props: { code: 'not a diagram' },
			global: { stubs: { UTooltip: tooltipStub } },
		});

		expect(wrapper.get('[role="alert"]').text()).toContain('Invalid mermaid header');
		expect(wrapper.find('.mermaid-canvas').exists()).toBe(false);
	});

	it('downloads the rendered SVG', async () => {
		const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:diagram');
		const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
			expect(this.isConnected).toBe(true);
		});
		const wrapper = await mountSuspended(Mermaid, {
			props: { code: diagram, filename: 'request-flow' },
			global: { stubs: { UTooltip: tooltipStub } },
		});

		await wrapper.get('[aria-label="Download diagram"]').trigger('click');
		await nextTick();
		const svgItem = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')]
			.find(item => item.textContent?.includes('Download SVG'));
		expect(svgItem).toBeDefined();
		svgItem?.click();
		await flushPromises();

		await vi.waitFor(() => {
			expect(createObjectUrl.mock.calls.some(([value]) => value.type.includes('svg'))).toBe(true);
		});
		const blob = createObjectUrl.mock.calls.find(([value]) => value.type.includes('svg'))?.[0];
		expect(blob).toBeInstanceOf(Blob);
		expect(blob?.type).toBe('image/svg+xml;charset=utf-8');
		const exportedSvg = await blob?.text();
		expect(exportedSvg).toContain('@font-face{font-family:\'Inter\'');
		expect(exportedSvg).toContain('data:font/woff2;base64,');
		expect(exportedSvg?.match(/data:font\/woff2;base64,/g)).toHaveLength(1);
		expect(exportedSvg).toContain('fill="#ffffff"');
		expect(exportedSvg).not.toContain('var(');
		expect(exportedSvg).not.toContain('color-mix(');
		expect(click).toHaveBeenCalledOnce();
		expect(document.querySelector('a[download="request-flow.svg"]')).toBeNull();
		expect(revokeObjectUrl).toHaveBeenCalledWith('blob:diagram');
	});

	it('converts the rendered SVG to PNG before downloading', async () => {
		const createObjectUrl = vi.spyOn(URL, 'createObjectURL')
			.mockImplementation(blob => blob.type === 'image/png' ? 'blob:png' : 'blob:svg');
		vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		const drawImage = vi.fn();
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(new Blob(['png'], { type: 'image/png' })));
		vi.stubGlobal('Image', class {
			onload: (() => void) | null = null;

			set src(_value: string) {
				queueMicrotask(() => this.onload?.());
			}
		});
		const wrapper = await mountSuspended(Mermaid, {
			props: { code: diagram, filename: 'request-flow' },
			global: { stubs: { UTooltip: tooltipStub } },
		});

		await wrapper.get('[aria-label="Download diagram"]').trigger('click');
		await nextTick();
		const pngItem = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')]
			.find(item => item.textContent?.includes('Download PNG'));
		expect(pngItem).toBeDefined();
		pngItem?.click();
		await flushPromises();

		await vi.waitFor(() => expect(drawImage).toHaveBeenCalledOnce());
		const svgBlob = createObjectUrl.mock.calls.find(([value]) => value.type.includes('svg'))?.[0];
		expect(await svgBlob?.text()).toContain('data:font/woff2;base64,');
		expect(createObjectUrl.mock.calls.some(([value]) => value.type === 'image/png')).toBe(true);
	});
});
