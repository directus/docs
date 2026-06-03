import type { Deployment } from './userPreferences';

export interface DeploymentOption {
	slug: Deployment;
	label: string;
	icon: string;
	description: string;
}

export const deployments: DeploymentOption[] = [
	{ slug: 'cloud', label: 'Directus Cloud', icon: 'i-lucide-cloud', description: 'Managed hosting by Directus.' },
	{ slug: 'self-hosted', label: 'Self-Hosted', icon: 'i-lucide-server', description: 'Run Directus on your own infrastructure.' },
];

export const getDeployment = (slug: string): DeploymentOption | undefined =>
	deployments.find(d => d.slug === slug);
