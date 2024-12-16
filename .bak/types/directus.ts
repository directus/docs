/**
 * The article area collection.
 */

interface ArticleArea {
	id: string; // UUID
	sort?: number; // Optional Integer
	slug: string; // String
	status: 'archived' | 'draft' | 'published' | string; // String or predefined status
	categories: ArticleCategory[]; // Array of ArticleCategory
}

/**
 * The article category collection.
 */
interface ArticleCategory {
	id: string; // UUID
	sort?: number; // Optional Integer
	slug: string; // String
	status: 'archived' | 'draft' | 'published' | string; // String or predefined status
	area?: string | ArticleArea; // Optional UUID or ArticleArea
	posts: ArticlePost[]; // Array of ArticlePost
}

/**
 * The article post collection.
 */
interface ArticlePost {
	id: string; // UUID
	sort?: number; // Optional Integer
	slug: string; // String
	status: 'archived' | 'draft' | 'published' | string; // String or predefined status
	category?: string | ArticleCategory; // Optional UUID or ArticleCategory
	content: string; // String
}

/**
 * The documentation area collection.
 */
interface DocumentationArea {
	id: string; // UUID
	sort?: number; // Optional Integer
	slug: string; // String
	type: 'documentation' | 'article';
	status: 'archived' | 'draft' | 'published' | string; // String or predefined status
	categories: DocumentationCategory[]; // Array of DocumentationCategory
}

/**
 * The documentation category collection.
 */
interface DocumentationCategory {
	id: string; // UUID
	area?: string | DocumentationArea; // Optional UUID or DocumentationArea
	slug: string; // String
	status: 'archived' | 'draft' | 'published' | string; // String or predefined status
	sort?: number; // Optional Integer
	pages: DocumentationPage[]; // Array of DocumentationPage
}

/**
 * The documentation page collection.
 */
interface DocumentationPage {
	id: string; // UUID
	category: string | DocumentationCategory; // UUID or DocumentationCategory
	slug: string; // String
	status: 'archived' | 'draft' | 'published' | string; // String or predefined status
	tags: DocumentationPagesTags[]; // Array of DocumentationPagesTags
	additional_paths: DocumentationAdditionalPath[]; // Array of Documentation
	authors: DocumentationPageAuthor[]; // Array of DocumentationPageAuthor
	title: string; // String
	description?: string; // String
	content: string; // String
	sort?: number; // Optional Integer
}

interface DocumentationTag {
	id: string; // UUID
	icon: string; // String
	name?: string; // String
}

interface DocumentationAdditionalPath {
	id: string; // UUID
	path: string; // String
	page: DocumentationPage; // UUID or DocumentationPage
}

interface DocumentationPagesTags {
	id: string; // UUID
	page: DocumentationPage; // UUID or DocumentationPage
	tag: DocumentationTag; // UUID or DocumentationTag
}

interface DocumentationBanner {
	id: string;
	message: string;
	link: string;
}

interface DocumentationWidget {
	id: string;
	title: string;
	message: string;
	link: string;
	link_text: string;
}

interface DocumentationAuthor {
	id: string;
	name: string;
	title: string;
	avatar: string;
}

interface DocumentationPageAuthor {
	id: string;
	page: DocumentationPage;
	author: DocumentationAuthor;
}

interface DocumentationFooter {
	id: number;
	description: string;
	groups: DocumenationFooterGroup[];
	socials: {
		id: number;
		sort: number;
		name: string;
		icon: string;
		href: string;
	}[];
	secondary_links: DocumentationFooterLink[];
}

interface DocumenationFooterGroup {
	id: number;
	sort: number;
	title: string;
	links: DocumentationFooterLink[];
}

interface DocumentationFooterLink {
	id: number;
	sort: number;
	page?: DocumentationPage;
	text?: string;
	href?: string;
}
export interface DirectusSchema {
	article_area: ArticleArea[];
	article_category: ArticleCategory[];
	article_post: ArticlePost[];
	documentation_area: DocumentationArea[];
	documentation_category: DocumentationCategory[];
	documentation_page: DocumentationPage[];
	documentation_tag: DocumentationTag[];
	documentation_additional_path: DocumentationAdditionalPath[];
	documentation_pages_tags: DocumentationPagesTags[];
	documentation_banner: DocumentationBanner[];
	documentation_author: DocumentationAuthor[];
	documentation_page_author: DocumentationPageAuthor[];
	documentation_widget: DocumentationWidget[];
	documentation_footer: DocumentationFooter;
	documentation_footer_group: DocumenationFooterGroup[];
	documentation_footer_link: DocumentationFooterLink[];
}
