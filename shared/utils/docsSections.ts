export type DocsSectionId
	= | 'getting-started'
		| 'guides'
		| 'deploy'
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
		icon: 'material-symbols:rocket-launch-outline',
	},
	{
		id: 'guides',
		label: 'Guides',
		to: '/guides/data-model/collections',
		prefixes: ['/guides'],
		icon: 'material-symbols:menu-book-outline',
	},
	{
		id: 'deploy',
		label: 'Hosting',
		to: '/cloud/getting-started/introduction',
		prefixes: ['/cloud', '/self-hosting', '/configuration'],
		icon: 'material-symbols:cloud-outline',
	},
	{
		id: 'frameworks',
		label: 'Frameworks',
		to: '/frameworks',
		prefixes: ['/frameworks'],
		icon: 'material-symbols:stacks-outline',
	},
	{
		id: 'api',
		label: 'API Reference',
		to: '/api',
		prefixes: ['/api'],
		icon: 'material-symbols:code',
	},
	// {
	// 	id: 'reference',
	// 	label: 'Reference',
	// 	to: '/reference/interfaces',
	// 	prefixes: ['/reference'],
	// 	icon: 'material-symbols:bookmarks-outline',
	// },
	{
		id: 'tutorials',
		label: 'Tutorials',
		to: '/tutorials',
		prefixes: ['/tutorials'],
		icon: 'material-symbols:article-outline',
	},
	{
		id: 'community',
		label: 'Community',
		to: '/community/overview/welcome',
		prefixes: ['/community', '/releases'],
		icon: 'material-symbols:groups-outline',
	},
];

export const docsGroups: DocsGroup[] = [
	{
		id: 'docs',
		label: 'Docs',
		to: '/getting-started/overview',
		icon: 'material-symbols:menu-book-outline',
		sectionIds: ['getting-started', 'guides', 'deploy', 'frameworks', 'community'],
	},
	{
		id: 'reference',
		label: 'API',
		to: '/api',
		icon: 'material-symbols:code',
		sectionIds: ['api'],
	},
	// {
	// 	id: 'legacy-reference',
	// 	label: 'Reference',
	// 	to: '/reference/interfaces',
	// 	icon: 'material-symbols:bookmarks-outline',
	// 	sectionIds: ['reference'],
	// },
	{
		id: 'examples',
		label: 'Tutorials',
		to: '/tutorials',
		icon: 'material-symbols:article-outline',
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
