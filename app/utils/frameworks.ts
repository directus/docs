export interface Framework {
	slug: string;
	label: string;
	icon: string;
	description: string;
	aliases?: string[];
}

export interface FrameworkGuide {
	title?: string;
	description?: string;
	path?: string;
	icon?: string;
	technologies?: string[];
	navigation?: boolean | { title?: string };
	stem?: string;
}

export interface CoreGuideLink {
	path: string;
	label: string;
	description: string;
	icon: string;
}

export const frameworks: Framework[] = [
	{ slug: 'nextjs', label: 'Next.js', icon: 'simple-icons:nextdotjs', description: 'Build content-driven React apps with Directus.' },
	{ slug: 'nuxt', label: 'Nuxt', icon: 'simple-icons:nuxt', description: 'Build Vue applications and websites with Directus.' },
	{ slug: 'astro', label: 'Astro', icon: 'simple-icons:astro', description: 'Create content sites with Astro and Directus.' },
	{ slug: 'sveltekit', label: 'SvelteKit', icon: 'simple-icons:svelte', description: 'Use Directus as the backend for SvelteKit apps.' },
	{ slug: 'react', label: 'React', icon: 'simple-icons:react', description: 'Connect React apps to Directus APIs and Realtime.' },
	{ slug: 'vue', label: 'Vue', icon: 'simple-icons:vuedotjs', description: 'Connect Vue apps to Directus APIs and Realtime.' },
	{ slug: 'angular', label: 'Angular', icon: 'simple-icons:angular', description: 'Fetch and render Directus data in Angular apps.' },
	{ slug: 'laravel', label: 'Laravel', icon: 'simple-icons:laravel', description: 'Use Directus with Laravel applications.' },
	{ slug: 'django', label: 'Django', icon: 'simple-icons:django', description: 'Use Directus with Django applications.' },
	{ slug: 'flask', label: 'Flask', icon: 'simple-icons:flask', description: 'Use Directus with Flask applications.' },
	{ slug: 'spring-boot', label: 'Spring Boot', icon: 'simple-icons:springboot', description: 'Use Directus with Spring Boot applications.', aliases: ['springboot'] },
	{ slug: 'flutter', label: 'Flutter', icon: 'simple-icons:flutter', description: 'Build cross-platform apps backed by Directus.' },
	{ slug: 'swift', label: 'iOS Swift', icon: 'simple-icons:swift', description: 'Use Directus in native iOS apps with Swift.' },
	{ slug: 'kotlin', label: 'Android Kotlin', icon: 'simple-icons:android', description: 'Use Directus in native Android apps with Kotlin.' },
	{ slug: 'eleventy', label: 'Eleventy', icon: 'simple-icons:eleventy', description: 'Build static sites with Eleventy and Directus.', aliases: ['11ty'] },
	{ slug: 'solidstart', label: 'SolidStart', icon: 'simple-icons:solid', description: 'Use Directus with SolidStart applications.' },
];

export const coreGuideLinks: CoreGuideLink[] = [
	{
		path: '/getting-started/overview',
		label: 'Start with Directus',
		description: 'Create a project and learn the core Directus workflow.',
		icon: 'material-symbols:rocket',
	},
	{
		path: '/guides/data-model/collections',
		label: 'Model your data',
		description: 'Create collections, fields, relationships, and interfaces.',
		icon: 'directus-explore',
	},
	{
		path: '/guides/connect/authentication',
		label: 'Use the API',
		description: 'Authenticate and connect your application to Directus APIs.',
		icon: 'directus-connect',
	},
	{
		path: '/guides/auth/tokens-cookies',
		label: 'Authenticate users',
		description: 'Understand Directus auth tokens, cookies, sessions, and roles.',
		icon: 'directus-auth',
	},
	{
		path: '/guides/files/upload',
		label: 'Manage files',
		description: 'Upload, serve, transform, and protect files in Directus.',
		icon: 'directus-files',
	},
	{
		path: '/guides/realtime/subscriptions',
		label: 'Use Realtime',
		description: 'Subscribe to live data changes with Directus Realtime.',
		icon: 'directus-realtime',
	},
];

const startHereSlugs = new Set([
	'data-fetching',
	'authentication',
	'build-a-cms',
]);

const commonTaskSlugs = new Set([
	'dynamic-pages',
	'forms',
	'dynamic-forms',
	'live-preview',
	'live-preview-setup',
	'live-preview-draft-mode',
	'visual-editor',
	'reusable-blocks',
	'multilingual-content',
	'internationalization',
	'pagination-infinite-scroll',
]);

const groupOrder: Record<string, number> = {
	'Start here': 1,
	'Common tasks': 2,
	'Example builds': 3,
	'Migration': 4,
	'More guides': 99,
};

export const getFramework = (slug: string): Framework | undefined =>
	frameworks.find(framework => framework.slug === slug);

export const getFrameworkSlugs = (framework: Framework): string[] => [
	framework.slug,
	...(framework.aliases ?? []),
];

export const hasFrameworkTechnology = (guide: FrameworkGuide, framework: Framework): boolean => {
	const technologies = guide.technologies ?? [];
	const slugs = getFrameworkSlugs(framework);
	return technologies.some(technology => slugs.includes(technology));
};

export const frameworkGuideGroup = (path: string | undefined): string => {
	const slug = path?.split('/').filter(Boolean).pop();

	if (!slug) return 'More guides';
	if (startHereSlugs.has(slug)) return 'Start here';
	if (commonTaskSlugs.has(slug)) return 'Common tasks';
	if (slug.startsWith('migrate-')) return 'Migration';

	return 'Example builds';
};

export const frameworkGuideGroupOrder = (path: string | undefined): number =>
	groupOrder[frameworkGuideGroup(path)] || 99;
