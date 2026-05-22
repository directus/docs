import type { Experience } from './userPreferences';

export interface ExperienceOption {
	slug: Experience;
	label: string;
	icon: string;
	description: string;
}

export const experiences: ExperienceOption[] = [
	{ slug: 'new', label: 'New to Directus', icon: 'material-symbols:auto-awesome-outline', description: 'First time or just evaluating.' },
	{ slug: 'familiar', label: 'Some Experience', icon: 'material-symbols:potted-plant-outline', description: 'Built something, still learning.' },
	{ slug: 'experienced', label: 'Power User', icon: 'material-symbols:forest-outline', description: 'Daily / production use.' },
];

export const getExperience = (slug: string): ExperienceOption | undefined =>
	experiences.find(e => e.slug === slug);
