export type DocsSectionId
	= | 'getting-started'
		| 'guides'
		| 'deploy'
		| 'configuration'
		| 'tutorials'
		| 'frameworks'
		| 'reference'
		| 'api'
		| 'community'
		| 'licensing';

export type DocsGroupId = 'docs' | 'reference' | 'legacy-reference' | 'examples' | 'licensing';

export interface DocsSection {
	id: DocsSectionId;
	label: string;
	to: string;
	prefixes: string[];
	icon: string;
}

export interface DocsGroup {
	id: DocsGroupId;
	label: string;
	to: string;
	icon: string;
	sectionIds: DocsSectionId[];
}

export const docsSections: DocsSection[] = [
	{
		id: 'getting-started',
		label: 'Get Started',
		to: '/getting-started/overview',
		prefixes: ['/getting-started'],
		icon: 'i-lucide-rocket',
	},
	{
		id: 'guides',
		label: 'Guides',
		to: '/guides/data-model/collections',
		prefixes: ['/guides'],
		icon: 'i-lucide-book-open',
	},
	{
		id: 'deploy',
		label: 'Hosting',
		to: '/cloud/getting-started/introduction',
		prefixes: ['/cloud', '/self-hosting'],
		icon: 'i-lucide-cloud',
	},
	{
		id: 'configuration',
		label: 'Configuration',
		to: '/configuration/intro',
		prefixes: ['/configuration'],
		icon: 'i-lucide-settings',
	},
	{
		id: 'frameworks',
		label: 'Frameworks',
		to: '/frameworks',
		prefixes: ['/frameworks'],
		icon: 'i-lucide-layers',
	},
	{
		id: 'api',
		label: 'API Reference',
		to: '/api',
		prefixes: ['/api'],
		icon: 'i-lucide-code',
	},
	// {
	// 	id: 'reference',
	// 	label: 'Reference',
	// 	to: '/reference/interfaces',
	// 	prefixes: ['/reference'],
	// 	icon: 'i-lucide-bookmark',
	// },
	{
		id: 'tutorials',
		label: 'Tutorials',
		to: '/tutorials',
		prefixes: ['/tutorials'],
		icon: 'i-lucide-file-text',
	},
	{
		id: 'community',
		label: 'Community',
		to: '/community/overview/welcome',
		prefixes: ['/community', '/releases'],
		icon: 'i-lucide-users',
	},
	{
		id: 'licensing',
		label: 'Licensing',
		to: '/licensing/overview',
		prefixes: ['/licensing'],
		icon: 'i-lucide-key-round',
	},
];

export const docsGroups: DocsGroup[] = [
	{
		id: 'docs',
		label: 'Docs',
		to: '/getting-started/overview',
		icon: 'i-lucide-book-open',
		sectionIds: ['getting-started', 'guides', 'deploy', 'configuration', 'frameworks', 'community'],
	},
	{
		id: 'reference',
		label: 'API',
		to: '/api',
		icon: 'i-lucide-code',
		sectionIds: ['api'],
	},
	// {
	// 	id: 'legacy-reference',
	// 	label: 'Reference',
	// 	to: '/reference/interfaces',
	// 	icon: 'i-lucide-bookmark',
	// 	sectionIds: ['reference'],
	// },
	{
		id: 'examples',
		label: 'Tutorials',
		to: '/tutorials',
		icon: 'i-lucide-file-text',
		sectionIds: ['tutorials'],
	},
	{
		id: 'licensing',
		label: 'Licensing',
		to: '/licensing/overview',
		icon: 'i-lucide-key-round',
		sectionIds: ['licensing'],
	},
];

export const matchesPrefix = (path: string, prefix: string) =>
	path === prefix || path.startsWith(`${prefix}/`);

export const findSectionByPath = (path: string): DocsSection | null =>
	docsSections.find(section =>
		section.prefixes.some(prefix => matchesPrefix(path, prefix)),
	) ?? null;

export const findGroupBySectionId = (sectionId: DocsSectionId): DocsGroup | null =>
	docsGroups.find(group => group.sectionIds.includes(sectionId)) ?? null;
