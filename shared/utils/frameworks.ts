export interface Framework {
	slug: string;
	label: string;
	icon: string;
	description: string;
}

export const frameworks: Framework[] = [
	{ slug: 'nextjs', label: 'Next.js', icon: 'simple-icons:nextdotjs', description: 'React framework for production.' },
	{ slug: 'nuxt', label: 'Nuxt', icon: 'simple-icons:nuxt', description: 'Intuitive Vue framework.' },
	{ slug: 'sveltekit', label: 'SvelteKit', icon: 'simple-icons:svelte', description: 'The fastest way to build Svelte apps.' },
	{ slug: 'astro', label: 'Astro', icon: 'simple-icons:astro', description: 'The web framework for content-driven websites.' },
	{ slug: 'react', label: 'React', icon: 'simple-icons:react', description: 'The library for web and native user interfaces.' },
	{ slug: 'vue', label: 'Vue', icon: 'simple-icons:vuedotjs', description: 'The progressive JavaScript framework.' },
	{ slug: 'angular', label: 'Angular', icon: 'simple-icons:angular', description: 'Web development platform built on TypeScript.' },
	{ slug: 'solidstart', label: 'SolidStart', icon: 'simple-icons:solid', description: 'Fine-grained reactive framework.' },
	{ slug: 'eleventy', label: 'Eleventy', icon: 'simple-icons:eleventy', description: 'A simpler static site generator.' },
	{ slug: 'flutter', label: 'Flutter', icon: 'simple-icons:flutter', description: 'Build apps for any screen.' },
	{ slug: 'kotlin', label: 'Android (Kotlin)', icon: 'simple-icons:android', description: 'Native Android development with Kotlin.' },
	{ slug: 'swift', label: 'iOS (Swift)', icon: 'simple-icons:swift', description: 'Native iOS development with Swift.' },
	{ slug: 'laravel', label: 'Laravel', icon: 'simple-icons:laravel', description: 'PHP framework for web artisans.' },
	{ slug: 'django', label: 'Django', icon: 'simple-icons:django', description: 'High-level Python web framework.' },
	{ slug: 'flask', label: 'Flask', icon: 'simple-icons:flask', description: 'Python micro web framework.' },
	{ slug: 'spring-boot', label: 'Spring Boot', icon: 'simple-icons:springboot', description: 'Production-grade Java applications.' },
];

export const getFramework = (slug: string): Framework | undefined =>
	frameworks.find(f => f.slug === slug);

const groupLabels: Record<string, string> = {
	'1.getting-started': 'Getting Started',
	'2.projects': 'Projects',
	'3.tips-and-tricks': 'Tips & Tricks',
	'4.migration': 'Migration',
	'5.extensions': 'Extensions',
	'6.self-hosting': 'Self-Hosting',
	'7.workflows': 'Workflows',
};

export const tutorialGroupLabel = (stem: string | undefined): string => {
	if (!stem) return 'Other';
	const segments = stem.split('/');
	const folder = segments[1];
	return (folder && groupLabels[folder]) || 'Other';
};

export const tutorialGroupOrder = (stem: string | undefined): number => {
	if (!stem) return 99;
	const folder = stem.split('/')[1] ?? '';
	const match = folder.match(/^(\d+)\./);
	return match ? Number(match[1]) : 99;
};
