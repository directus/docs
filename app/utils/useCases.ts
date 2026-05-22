export interface UseCase {
	slug: string;
	label: string;
	icon: string;
	description: string;
}

export const useCases: UseCase[] = [
	{ slug: 'headless-cms', label: 'Headless CMS', icon: 'material-symbols:article-outline', description: 'Power websites and apps with structured content.' },
	{ slug: 'client-website', label: 'Client Website', icon: 'material-symbols:language', description: 'Marketing sites and client projects.' },
	{ slug: 'internal-tool', label: 'Internal App', icon: 'material-symbols:corporate-fare', description: 'Admin panels and internal tooling.' },
	{ slug: 'api-backend', label: 'API Backend', icon: 'material-symbols:api', description: 'Data platform and backend-as-a-service.' },
	{ slug: 'multi-tenant-app', label: 'Multi-Tenant App', icon: 'material-symbols:groups-outline', description: 'SaaS apps serving multiple customers.' },
	{ slug: 'ecommerce', label: 'Ecommerce', icon: 'material-symbols:shopping-cart-outline', description: 'Storefronts and product catalogs.' },
	{ slug: 'other', label: 'Other', icon: 'material-symbols:more-horiz', description: 'Something else.' },
];

export const getUseCase = (slug: string): UseCase | undefined =>
	useCases.find(u => u.slug === slug);
