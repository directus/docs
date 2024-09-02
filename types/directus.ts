/**
 * The article area collection.
 */

interface ArticleArea {
	id: string; // UUID
	sort?: number; // Optional Integer
	user_created?: string; // Optional UUID
	date_created?: string | Date; // Optional DateTime
	user_updated?: string; // Optional UUID
	date_updated?: string | Date; // Optional DateTime
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
	user_created?: string; // Optional UUID
	date_created?: string | Date; // Optional DateTime
	user_updated?: string; // Optional UUID
	date_updated?: string | Date; // Optional DateTime
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
	user_created?: string; // Optional UUID
	date_created?: string | Date; // Optional DateTime
	user_updated?: string; // Optional UUID
	date_updated?: string | Date; // Optional DateTime
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
	user_created?: string; // Optional UUID
	date_created?: string | Date; // Optional DateTime
	user_updated?: string; // Optional UUID
	date_updated?: string | Date; // Optional DateTime
	slug: string; // String
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
	user_created?: string; // Optional UUID
	date_created?: string | Date; // Optional DateTime
	user_updated?: string; // Optional UUID
	date_updated?: string | Date; // Optional DateTime
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
	title: string; // String
	content: string; // String
	sort?: number; // Optional Integer
	user_created?: string; // Optional UUID
	date_created?: string | Date; // Optional DateTime
	user_updated?: string; // Optional UUID
	date_updated?: string | Date; // Optional DateTime
}

export interface DirectusSchema {
	article_area: ArticleArea[];
	article_category: ArticleCategory[];
	article_post: ArticlePost[];
	documentation_area: DocumentationArea[];
	documentation_category: DocumentationCategory[];
	documentation_page: DocumentationPage[];
}
