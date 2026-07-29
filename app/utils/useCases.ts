export interface UseCase {
	slug: string;
	label: string;
	icon: string;
	description: string;
}

export const useCases: UseCase[] = [
	{ slug: 'headless-cms', label: 'Headless CMS', icon: 'i-lucide-file-text', description: 'Power websites and apps with structured content.' },
	{ slug: 'client-website', label: 'Client Website', icon: 'i-lucide-globe', description: 'Marketing sites and client projects.' },
	{ slug: 'internal-tool', label: 'Internal App', icon: 'i-lucide-building-2', description: 'Admin panels and internal tooling.' },
	{ slug: 'api-backend', label: 'API Backend', icon: 'i-lucide-braces', description: 'Data platform and backend-as-a-service.' },
	{ slug: 'multi-tenant-app', label: 'Multi-Tenant App', icon: 'i-lucide-users', description: 'SaaS apps serving multiple customers.' },
	{ slug: 'ecommerce', label: 'Ecommerce', icon: 'i-lucide-shopping-cart', description: 'Storefronts and product catalogs.' },
	{ slug: 'other', label: 'Other', icon: 'i-lucide-ellipsis', description: 'Something else.' },
];

export const getUseCase = (slug: string): UseCase | undefined =>
	useCases.find(u => u.slug === slug);
