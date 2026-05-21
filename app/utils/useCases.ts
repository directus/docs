export interface UseCase {
	slug: string;
	label: string;
	icon: string;
	description: string;
}

export const useCases: UseCase[] = [
	{ slug: 'headless-cms', label: 'Headless CMS', icon: 'i-ph-article', description: 'Power websites and apps with structured content.' },
	{ slug: 'client-website', label: 'Client Website', icon: 'i-ph-globe', description: 'Marketing sites and client projects.' },
	{ slug: 'internal-tool', label: 'Internal App', icon: 'i-ph-buildings', description: 'Admin panels and internal tooling.' },
	{ slug: 'api-backend', label: 'API Backend', icon: 'i-ph-plugs-connected', description: 'Data platform and backend-as-a-service.' },
	{ slug: 'multi-tenant-app', label: 'Multi-Tenant App', icon: 'i-ph-users-three', description: 'SaaS apps serving multiple customers.' },
	{ slug: 'ecommerce', label: 'Ecommerce', icon: 'i-ph-shopping-cart', description: 'Storefronts and product catalogs.' },
	{ slug: 'other', label: 'Other', icon: 'i-ph-dots-three-circle', description: 'Something else.' },
];

export const getUseCase = (slug: string): UseCase | undefined =>
	useCases.find(u => u.slug === slug);
