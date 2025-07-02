export interface SiteBanner {
	id: string;
	status: string;
	sort: number | null;
	user_created: string | null;
	date_created: string | null;
	user_updated: string | null;
	date_updated: string | null;
	link: string | null;
	content: string | null;
	icon: string;
	show_on: string[];
}
export interface Schema {
	site_banners: SiteBanner[];
}
