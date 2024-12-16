import fs from "node:fs/promises";
import formatTitle from "@directus/format-title";
import { stringifyYAML } from "confbox";
import { consola } from "consola";
import { resolve } from "path";
import { db, readItems } from "../../utils/directus";

type PathPart = {
	sort: number;
	slug: string;
};

type PathPartArray = PathPart[];

const availablePageStyles = [
	'DocumentationPage',
	'ArticleArea',
	'ArticleCategory',
	'ArticlePage',
];

export const docPages = async () => {
	const data = await db.request(
		readItems('documentation_area', {
			fields: [
				'id',
				'slug',
				'type',
				'sort',
				{
					categories: [
						'id',
						'slug',
						'sort',
						{
							pages: [
								'id',
								'slug',
								'title',
								'description',
								'content',
								'sort',
								{ tags: [{ tag: ['id', 'icon', 'name'] }] },
								{ additional_paths: ['id', 'path'] },
								{ authors: [{ author: ['id', 'name', 'title', 'avatar'] }] },
							],
						},
					],
				},
			],
			limit: 5000,
		}),
	);

	return data;
};

async function writePage(
	dir: string,
	pathParts: PathPartArray,
	config: Record<string, unknown>,
	content?: string,
) {
	const dirPath = resolve(
		dir,
		'.remote',
		...pathParts.slice(0, -1).map(part => `${part.sort}.${part.slug}`),
	);
	const pagePath = resolve(
		dir,
		'.remote',
		...pathParts.map(part => `${part.sort}.${part.slug}`),
	);

	const pageConfig = stringifyYAML(config);
	const pageContent = `---\n${pageConfig}\n---\n${content || 'Explore our resources and powerful data engine to build your projects confidently.'}`;
	await fs.mkdir(dirPath, { recursive: true });
	await fs.writeFile(`${pagePath}.md`, pageContent);
	return;
}

export const buildPages = async (dir: string) => {
	consola.info('Fetching remote content');

	const docs = await docPages();

	consola.info(`Writing Remote Content to /.remote`);

	const remotePath = resolve(dir, '.remote');

	if (
		await fs
			.access(remotePath)
			.then(() => true)
			.catch(() => false)
	) {
		await fs.rm(remotePath, { recursive: true });
	}

	for (const area of docs) {
		const areaStyle = `${formatTitle(area.type)}Area`;
		if (availablePageStyles.includes(areaStyle)) {
			await writePage(dir, [{ sort: area.sort || 0, slug: area.slug }], {
				style: `${formatTitle(area.type)}Area`,
				...area,
				categories: undefined,
			});
		}
		if (!area.categories) continue;
		for (const category of area.categories) {
			const categoryStyle = `${formatTitle(area.type)}Category`;
			if (availablePageStyles.includes(categoryStyle)) {
				await writePage(
					dir,
					[
						{ sort: area.sort || 0, slug: area.slug },
						{ sort: category.sort || 0, slug: category.slug },
					],
					{
						style: `${formatTitle(area.type)}Category`,
						...category,
						pages: undefined,
					},
				);
			}
			if (!category.pages) continue;
			for (const page of category.pages) {
				const pageStyle = `${formatTitle(area.type)}Page`;
				if (availablePageStyles.includes(pageStyle)) {
					await writePage(
						dir,
						[
							{ sort: area.sort || 0, slug: area.slug },
							{ sort: category.sort || 0, slug: category.slug },
							{ sort: page.sort || 0, slug: page.slug },
						],
						{
							style: `${formatTitle(area.type)}Page`,
							...page,
							tags: page.tags?.map(tag => tag.tag),
							additional_paths: page.additional_paths?.map(path => path.path),
							content: undefined,
							authors: page.authors?.map(author => author.author),
							...(page.description ? { description: page.description } : { description: undefined }),
						},
						page.content,
					);
				}
			}
		}
	}

	consola.success('Finished Building Remote Content');
};
