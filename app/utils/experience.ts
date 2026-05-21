import type { Experience } from './userPreferences';

export interface ExperienceOption {
	slug: Experience;
	label: string;
	icon: string;
	description: string;
}

export const experiences: ExperienceOption[] = [
	{ slug: 'new', label: 'New to Directus', icon: 'i-ph-sparkle', description: 'First time or just evaluating.' },
	{ slug: 'familiar', label: 'Some Experience', icon: 'i-ph-plant', description: 'Built something, still learning.' },
	{ slug: 'experienced', label: 'Power User', icon: 'i-ph-tree', description: 'Daily / production use.' },
];

export const getExperience = (slug: string): ExperienceOption | undefined =>
	experiences.find(e => e.slug === slug);
