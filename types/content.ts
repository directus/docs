import type { ParsedContent, Toc } from '@nuxt/content';

declare global {

	type BaseNavItem = {
		title: string;
		_path: string;
		_id?: string;
		_draft?: boolean;
		children?: BaseNavItem[];
		additional_paths?: string[];
		root?: boolean;
		expandable?: boolean;
	};

	type BaseNavItems = BaseNavItem[];

	type ArticleTag = {
		id: string;
		icon: string;
		name: string;
	};

	type ArticleTags = ArticleTag[];

	type ArticleNavItem = {
		tags?: ArticleTags;
		children?: ArticleNavItem[];
		[key: string]: unknown;
	} & BaseNavItem;

	type ArticleNavItems = ArticleNavItem[];

	type NavItem = ArticleNavItem | BaseNavItem;

	type NavItems = NavItem[];

	type PageContent = { _path: string } & ParsedContent;

	type PageToc = {} & Toc;

	type AllPages = Pick<ParsedContent, '_path' | 'additional_paths'>[];
}

export {};
