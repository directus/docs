export type DocsSectionId
	= | 'getting-started'
		| 'guides'
		| 'deploy'
		| 'studio'
		| 'tutorials'
		| 'frameworks'
		| 'reference'
		| 'api'
		| 'community';

export type DocsGroupId = 'docs' | 'reference' | 'legacy-reference' | 'examples';

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
		icon: 'i-ph-rocket-launch',
	},
	{
		id: 'guides',
		label: 'Guides',
		to: '/guides/data-model/collections',
		prefixes: ['/guides'],
		icon: 'i-ph-book-open',
	},
	{
		id: 'deploy',
		label: 'Hosting',
		to: '/cloud/getting-started/introduction',
		prefixes: ['/cloud', '/self-hosting', '/configuration'],
		icon: 'i-ph-cloud',
	},
	{
		id: 'studio',
		label: 'Studio',
		to: '/guides/content/editor',
		prefixes: ['/studio'],
		icon: 'i-ph-monitor-play',
	},
	{
		id: 'frameworks',
		label: 'Frameworks',
		to: '/frameworks',
		prefixes: ['/frameworks'],
		icon: 'i-ph-stack',
	},
	{
		id: 'api',
		label: 'API Reference',
		to: '/api',
		prefixes: ['/api'],
		icon: 'i-ph-code',
	},
	{
		id: 'reference',
		label: 'Reference',
		to: '/reference/interfaces',
		prefixes: ['/reference'],
		icon: 'i-ph-book-bookmark',
	},
	{
		id: 'tutorials',
		label: 'Tutorials',
		to: '/tutorials',
		prefixes: ['/tutorials'],
		icon: 'i-ph-article',
	},
	{
		id: 'community',
		label: 'Community',
		to: '/community/overview/welcome',
		prefixes: ['/community', '/releases'],
		icon: 'i-ph-users-three',
	},
];

export const docsGroups: DocsGroup[] = [
	{
		id: 'docs',
		label: 'Docs',
		to: '/getting-started/overview',
		icon: 'i-ph-book-open',
		sectionIds: ['getting-started', 'guides', 'deploy', 'studio', 'frameworks', 'community'],
	},
	{
		id: 'reference',
		label: 'API ',
		to: '/api',
		icon: 'i-ph-code',
		sectionIds: ['api'],
	},
	// {
	// 	id: 'legacy-reference',
	// 	label: 'Reference',
	// 	to: '/reference/interfaces',
	// 	icon: 'i-ph-book-bookmark',
	// 	sectionIds: ['reference'],
	// },
	{
		id: 'examples',
		label: 'Tutorials',
		to: '/tutorials',
		icon: 'i-ph-article',
		sectionIds: ['tutorials'],
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
