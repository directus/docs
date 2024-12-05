import { db, readSingleton } from './directus';

type AppConfig = {
	footer: {
		id: string;
		socials: {
			sort: number;
			name: string;
			icon: string;
			href: string;
		}[];
		description: string;
		secondary_links: {
			id: string;
			text?: string;
			href?: string;
			sort: number;
			page?: {
				id: string;
				slug: string;
				title: string;
				category: {
					id: string;
					slug: string;
					area: {
						id: string;
						slug: string;
					};
				};
			};
		}[];
		groups: {
			id: string;
			sort: number;
			title: string;
			links: {
				id: string;
				text?: string;
				href?: string;
				sort: number;
				page?: {
					id: string;
					slug: string;
					title: string;
					category: {
						id: string;
						slug: string;
						area: {
							id: string;
							slug: string;
						};
					};
				};
			}[];
		}[];
	};
};

export const appConfig = async () => {
	console.log('Fetching app config');
	const footer = await db.request(
		readSingleton('documentation_footer', {
			fields: [
				'id',
				'socials',
				'description',
				{
					secondary_links: [
						'id',
						'text',
						'href',
						'sort',
						{
							page: [
								'id',
								'slug',
								'title',
								{ category: ['id', 'slug', { area: ['id', 'slug'] }] },
							],
						},
					],
				},
				{
					groups: [
						'id',
						'sort',
						'title',
						{
							links: [
								'id',
								'text',
								'href',
								'sort',
								{
									page: [
										'id',
										'slug',
										'title',
										{ category: ['id', 'slug', { area: ['id', 'slug'] }] },
									],
								},
							],
						},
					],
				},
			],
			deep: {
				groups: {
					_sort: ['sort'],
					links: {
						_sort: ['sort'],
					},
				},
			},
		}),
	);

	return { footer } as unknown as AppConfig;
};
