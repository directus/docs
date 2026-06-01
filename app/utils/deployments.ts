import type { Deployment } from './userPreferences';

export interface DeploymentOption {
	slug: Deployment;
	label: string;
	icon: string;
	description: string;
}

export const deployments: DeploymentOption[] = [
	{ slug: 'cloud', label: 'Directus Cloud', icon: 'material-symbols:cloud-outline', description: 'Managed hosting by Directus.' },
	{ slug: 'self-hosted', label: 'Self-Hosted', icon: 'material-symbols:dns-outline', description: 'Run Directus on your own infrastructure.' },
];

export const getDeployment = (slug: string): DeploymentOption | undefined =>
	deployments.find(d => d.slug === slug);
