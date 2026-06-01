import type { Role } from './userPreferences';

export interface RoleOption {
	slug: Role;
	label: string;
	icon: string;
	description: string;
}

export const roles: RoleOption[] = [
	{ slug: 'developer', label: 'Developer', icon: 'material-symbols:code', description: 'Show code-first content and technical detail.' },
	{ slug: 'non-developer', label: 'Non-Developer', icon: 'material-symbols:person-outline', description: 'Focus on UI workflows and concepts.' },
];

export const getRole = (slug: string): RoleOption | undefined =>
	roles.find(r => r.slug === slug);
