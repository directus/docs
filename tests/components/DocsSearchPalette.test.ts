import { nextTick, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import DocsSearchPalette from '../../app/components/DocsSearchPalette.vue';
import DocsSearchPreview from '../../app/components/DocsSearchPreview.vue';

const {
	defineShortcutsMock,
	navigateToMock,
	useDocsSearchMock,
	usePageHistoryMock,
} = vi.hoisted(() => ({
	defineShortcutsMock: vi.fn(),
	navigateToMock: vi.fn(),
	useDocsSearchMock: vi.fn(),
	usePageHistoryMock: vi.fn(),
}));

mockNuxtImport('useDocsSearch', () => useDocsSearchMock);
mockNuxtImport('usePageHistory', () => usePageHistoryMock);
mockNuxtImport('defineShortcuts', () => defineShortcutsMock);
mockNuxtImport('navigateTo', () => navigateToMock);

const stubHits = [
	{
		id: '1',
		to: '/guides/data-model/collections',
		title: 'Collections',
		titleHtml: 'Collections',
		breadcrumb: 'Guides › Data Model',
		snippetHtml: 'Create and manage collections.',
		content: 'Create and manage collections.',
		section: 'guides',
		sectionLabel: 'Guides',
		docTypeLabel: 'Guide',
		docType: 'page',
	},
	{
		id: '2',
		to: '/frameworks/nuxt/authentication',
		title: 'Nuxt Authentication',
		titleHtml: 'Nuxt Authentication',
		breadcrumb: 'Frameworks › Nuxt',
		snippetHtml: 'Authenticate users in Nuxt.',
		content: 'Authenticate users in Nuxt.',
		section: 'frameworks',
		sectionLabel: 'Frameworks',
		framework: 'nuxt',
		docTypeLabel: 'Guide',
		docType: 'page',
	},
	{
		id: '3',
		to: '/api/items#create-multiple-items',
		title: 'POST /items/{collection}',
		titleHtml: 'POST /items/{collection}',
		breadcrumb: 'API Reference › Items',
		snippetHtml: 'Create item records.',
		content: 'Create item records.',
		section: 'api',
		sectionLabel: 'API Reference',
		docTypeLabel: 'Reference',
		docType: 'api-operation',
	},
	{
		id: '4',
		to: '/reference/query-parameters',
		title: 'Query Parameters',
		titleHtml: 'Query Parameters',
		breadcrumb: 'Reference',
		snippetHtml: 'Filter and paginate responses.',
		content: 'Filter and paginate responses.',
		section: 'reference',
		sectionLabel: 'Reference',
		docTypeLabel: 'Reference',
		docType: 'page',
	},
	{
		id: '5',
		to: '/tutorials/build-a-chat-app',
		title: 'Build a Chat App',
		titleHtml: 'Build a Chat App',
		breadcrumb: 'Tutorials',
		snippetHtml: 'Step-by-step chat app tutorial.',
		content: 'Step-by-step chat app tutorial.',
		section: 'tutorials',
		sectionLabel: 'Tutorials',
		docTypeLabel: 'Tutorial',
		docType: 'page',
	},
] as const;

describe('DocsSearchPalette', () => {
	const query = ref('auth');
	const section = ref<'all' | 'guides' | 'frameworks' | 'api' | 'reference' | 'tutorials'>('all');
	const pending = ref(false);
	const found = ref(stubHits.length);
	const items = ref([...stubHits]);
	const sectionCounts = ref(new Map([
		['guides', 1],
		['frameworks', 1],
		['api', 1],
		['reference', 1],
		['tutorials', 1],
	]));
	const clearMock = vi.fn();

	beforeEach(() => {
		query.value = 'auth';
		section.value = 'all';
		pending.value = false;
		found.value = stubHits.length;
		items.value = [...stubHits];
		sectionCounts.value = new Map([
			['guides', 1],
			['frameworks', 1],
			['api', 1],
			['reference', 1],
			['tutorials', 1],
		]);
		clearMock.mockReset();
		navigateToMock.mockReset();
		useDocsSearchMock.mockReset();
		usePageHistoryMock.mockReset();
		defineShortcutsMock.mockReset();

		useDocsSearchMock.mockReturnValue({
			query,
			section,
			pending,
			found,
			items,
			sectionCounts,
			minQueryLength: 2,
			isTooShort: ref(false),
			clear: clearMock,
		});

		usePageHistoryMock.mockReturnValue({
			recents: ref([]),
			favorites: ref([]),
		});

		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: vi.fn().mockResolvedValue(undefined) },
			configurable: true,
		});

		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			configurable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: query.includes('min-width: 640px'),
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	});

	async function mountPalette() {
		return mountSuspended(DocsSearchPalette, {
			props: { open: false },
			global: {
				provide: {
					navigation: ref([
						{
							title: 'Frameworks',
							path: '/frameworks',
							children: [
								{
									title: 'Nuxt',
									path: '/frameworks/nuxt',
									children: [
										{ title: 'Nuxt Authentication', path: '/frameworks/nuxt/authentication' },
									],
								},
							],
						},
					]),
				},
			},
		});
	}

	async function openPalette(wrapper: Awaited<ReturnType<typeof mountPalette>>) {
		await wrapper.setProps({ open: true });
		await nextTick();
	}

	function findButton(label: string) {
		return [...document.querySelectorAll('button')]
			.find(button => button.textContent?.includes(label));
	}

	it('scopes [/] keydown to open state', async () => {
		const wrapper = await mountPalette();

		window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));
		await nextTick();
		expect(section.value).toBe('all');

		await openPalette(wrapper);
		window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));
		await nextTick();
		expect(section.value).toBe('guides');
	});

	it('renders the preview pane with a docs-prefixed display path', async () => {
		const wrapper = await mountPalette();
		await openPalette(wrapper);
		items.value = [...stubHits];
		await nextTick();

		const preview = wrapper.getComponent(DocsSearchPreview);
		expect(preview.text()).toContain('/docs/guides/data-model/collections');
	});

	it('keeps preview actions wired through the parent', async () => {
		const wrapper = await mountPalette();
		await openPalette(wrapper);

		const openButton = findButton('Open page');
		const copyButton = findButton('Copy link');
		expect(openButton).toBeTruthy();
		expect(copyButton).toBeTruthy();

		const preview = wrapper.getComponent(DocsSearchPreview);
		copyButton?.click();
		await nextTick();
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/docs/guides/data-model/collections`);

		const externalHit = {
			...stubHits[1],
			to: 'http://docs.example.com/frameworks/nuxt/authentication',
		};
		const palette = wrapper.findComponent({ name: 'UCommandPalette' });
		palette.vm.$emit('highlight', { ref: document.createElement('div'), value: externalHit });
		await nextTick();

		preview.vm.$emit('open');
		await nextTick();
		expect(navigateToMock).toHaveBeenCalledWith('http://docs.example.com/frameworks/nuxt/authentication', { external: true });
	});
});
