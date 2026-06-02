import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spec as openapi } from '@directus/openapi';
import { get } from 'lodash-es';
import type {
	OpenAPIObject,
	OperationObject,
	ParameterObject,
	PathItemObject,
	ReferenceObject,
	RequestBodyObject,
	ResponseObject,
	SchemaObject,
} from 'openapi3-ts/oas30';
import type {
	ApiReferenceCodeSample,
	ApiReferenceOperation,
	ApiReferenceParameter,
	ApiReferenceResponse,
	ApiReferenceTagPage,
	FlattenedParam,
} from '../app/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'app/generated/api-reference');
const tagsDir = join(outputDir, 'tags');

const methods: (keyof PathItemObject)[] = [
	'get',
	'put',
	'post',
	'delete',
	'options',
	'head',
	'patch',
	'trace',
];

const refCache = new Map<string, unknown>();
const flattenCache = new Map<string, FlattenedParam | null>();

function slugify(val: string): string {
	return val
		.replace(/[!"#$%&'()*+,/:;<=>?@[\\\]^`{|}~]/g, '')
		.replace(/(\s|\.)/g, '-')
		.replace(/<(?:.|\n)*?>/gm, '')
		.replace(/—/g, '--')
		.replace(/-{2,}/g, '-')
		.toLowerCase();
}

function decodePointerPart(part: string): string {
	return part.replace(/~1/g, '/').replace(/~0/g, '~');
}

function resolveRef<O = unknown>(spec: OpenAPIObject, path: string): O | null {
	if (refCache.has(path)) return refCache.get(path) as O | null;
	if (!path.startsWith('#/')) return null;

	const pathParts = path.slice(2).split('/').map(decodePointerPart);
	const resolved = get(spec, pathParts, null) as O | null;
	refCache.set(path, resolved);
	return resolved;
}

function resolveSchema(schemaOrRef: SchemaObject | ReferenceObject): SchemaObject | null {
	return '$ref' in schemaOrRef ? resolveRef<SchemaObject>(openapi, schemaOrRef.$ref) : schemaOrRef;
}

function flattenSchema(schemaOrRef: SchemaObject | ReferenceObject, name?: string, seen: Set<string> = new Set()): FlattenedParam | null {
	const ref = '$ref' in schemaOrRef ? schemaOrRef.$ref : null;

	if (ref) {
		if (seen.has(ref)) return { name, type: 'object', description: undefined };
		if (flattenCache.has(ref)) {
			const cached = flattenCache.get(ref)!;
			return cached ? { ...cached, name } : null;
		}
	}

	const schema = ref ? resolveRef<SchemaObject>(openapi, ref) : schemaOrRef as SchemaObject;
	if (!schema) return null;

	const nextSeen = ref ? new Set(seen).add(ref) : seen;
	const type = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type;
	const node: FlattenedParam = { name, type, description: schema.description };

	if ('anyOf' in schema && schema.anyOf) {
		node.anyOf = schema.anyOf
			.map(child => flattenSchema(child, undefined, nextSeen))
			.filter((child): child is FlattenedParam => child !== null);
	}
	else if (schema.type === 'object') {
		node.children = Object.entries(schema.properties ?? {})
			.map(([key, value]) => flattenSchema(value, key, nextSeen))
			.filter((child): child is FlattenedParam => child !== null);
	}
	else if (schema.type === 'array') {
		const parsedItems = flattenSchema(schema.items ?? {}, undefined, nextSeen);
		if (parsedItems) node.children = [parsedItems];
	}

	if (ref) flattenCache.set(ref, { ...node, name: undefined });
	return node;
}

function responseToExample(root: SchemaObject): unknown | null {
	if (root.type !== 'object' && !(root.type === 'array' || root.type === 'string')) return null;

	const parseLevel = (schemaOrRef: SchemaObject | ReferenceObject, seen: Set<string> = new Set()): unknown => {
		const ref = '$ref' in schemaOrRef ? schemaOrRef.$ref : null;
		if (ref && seen.has(ref)) return undefined;

		const schemaObj = ref ? resolveRef<SchemaObject>(openapi, ref) : schemaOrRef as SchemaObject;
		if (!schemaObj) return undefined;
		if ('example' in schemaObj) return schemaObj.example;

		const nextSeen = ref ? new Set(seen).add(ref) : seen;

		if (schemaObj.type === 'object') {
			const obj: Record<string, unknown> = {};

			if (schemaObj.properties) {
				for (const [key, value] of Object.entries(schemaObj.properties)) {
					const parsedVal = parseLevel(value, nextSeen);
					if (parsedVal !== undefined) obj[key] = parsedVal;
				}
			}

			return obj;
		}

		if (schemaObj.type === 'array') {
			if (schemaObj.items) {
				const parsedVal = parseLevel(schemaObj.items, nextSeen);
				if (parsedVal !== undefined) return [parsedVal];
				return [];
			}

			return [];
		}
	};

	const exampleObject = parseLevel(root);
	if (root.type === 'array') return [exampleObject];
	return exampleObject ?? null;
}

function resolveRequestBody(requestBody: OperationObject['requestBody']): RequestBodyObject | null {
	if (!requestBody) return null;
	return '$ref' in requestBody ? resolveRef<RequestBodyObject>(openapi, requestBody.$ref) : requestBody;
}

function resolveResponse(response: ReferenceObject | ResponseObject): ResponseObject | null {
	return '$ref' in response ? resolveRef<ResponseObject>(openapi, response.$ref) : response;
}

function resolveParameter(parameter: ReferenceObject | ParameterObject): ParameterObject | null {
	return '$ref' in parameter ? resolveRef<ParameterObject>(openapi, parameter.$ref) : parameter;
}

function apiParameter(parameter: ParameterObject): ApiReferenceParameter {
	const schema = parameter.schema ? resolveSchema(parameter.schema) : null;
	const type = Array.isArray(schema?.type) ? schema.type.join(' | ') : schema?.type;

	return {
		name: parameter.name,
		description: parameter.description,
		schema: type ? { type } : undefined,
	};
}

function requestBodyData(operation: OperationObject): ApiReferenceOperation['requestBody'] {
	const requestBody = resolveRequestBody(operation.requestBody);
	if (!requestBody) return null;

	const contentSchema = requestBody.content?.['application/json']?.schema;
	return {
		description: requestBody.description,
		schema: contentSchema ? flattenSchema(contentSchema) : null,
	};
}

function responseData(operation: OperationObject): ApiReferenceResponse[] {
	return Object.entries(operation.responses ?? {}).map(([code, responseOrRef]) => {
		const response = resolveResponse(responseOrRef);
		const contentSchema = response?.content?.['application/json']?.schema;

		return {
			code,
			description: response?.description,
			schema: contentSchema ? flattenSchema(contentSchema) : null,
		};
	});
}

function responseExample(operation: OperationObject): unknown | null {
	const responseRef = operation.responses?.['200'];
	if (!responseRef) return null;

	const response = resolveResponse(responseRef);
	const responseSchema = response?.content?.['application/json']?.schema
		?? response?.content?.['application/text']?.schema;
	const schema = responseSchema ? resolveSchema(responseSchema) : null;

	return schema ? responseToExample(schema) : null;
}

function apiOperation(path: string, method: keyof PathItemObject, operation: OperationObject): ApiReferenceOperation {
	const codeSamples = (operation as OperationObject & { 'x-codeSamples'?: ApiReferenceCodeSample[] })['x-codeSamples'];

	return {
		method,
		path,
		summary: operation.summary,
		description: operation.description,
		parameters: (operation.parameters ?? [])
			.map(resolveParameter)
			.filter((parameter): parameter is ParameterObject => parameter !== null)
			.map(apiParameter),
		requestBody: requestBodyData(operation),
		responses: responseData(operation),
		responseExample: responseExample(operation),
		...(codeSamples?.length ? { 'x-codeSamples': codeSamples } : {}),
	};
}

function operationsByTag() {
	const byTag = new Map<string, ApiReferenceOperation[]>();

	for (const [path, pathItemObject] of Object.entries(openapi.paths)) {
		for (const method of methods) {
			const operation = pathItemObject[method] as OperationObject | undefined;
			if (!operation) continue;

			for (const tag of operation.tags ?? []) {
				byTag.set(tag, [...(byTag.get(tag) ?? []), apiOperation(path, method, operation)]);
			}
		}
	}

	return byTag;
}

function navigation(byTag: Map<string, ApiReferenceOperation[]>) {
	return (openapi.tags ?? [])
		.map((tag) => {
			const operations = byTag.get(tag.name);
			if (!operations?.length) return null;

			const slug = tag.name.toLowerCase();

			return {
				title: tag.name,
				to: `/api/${slug}`,
				path: `/api/${slug}`,
				children: operations.map(operation => ({
					title: operation.summary ?? operation.path,
					path: `/api/${slug}#${slugify(operation.summary!)}`,
					exact: true,
					exactHash: true,
				})),
			};
		})
		.filter(item => item !== null);
}

async function writeIfChanged(path: string, content: string) {
	if (existsSync(path)) {
		const current = await readFile(path, 'utf8');
		if (current === content) return;
	}

	await writeFile(path, content);
}

async function cleanOldTagFiles(validFiles: Set<string>) {
	if (!existsSync(tagsDir)) return;

	for (const file of await readdir(tagsDir)) {
		if (file.endsWith('.ts') && !validFiles.has(file)) {
			await rm(join(tagsDir, file));
		}
	}
}

async function main() {
	await mkdir(tagsDir, { recursive: true });

	const byTag = operationsByTag();
	const validFiles = new Set<string>();
	const routes: string[] = [];

	for (const tag of openapi.tags ?? []) {
		const operations = byTag.get(tag.name);
		if (!operations?.length) continue;

		const slug = tag.name.toLowerCase();
		const fileName = `${slug}.ts`;
		const page: ApiReferenceTagPage = {
			tag: {
				name: tag.name,
				description: tag.description,
			},
			operations,
		};

		validFiles.add(fileName);
		routes.push(`/api/${slug}`);

		await writeIfChanged(
			join(tagsDir, fileName),
			`// Generated by scripts/generate-api-reference.ts\nimport type { ApiReferenceTagPage } from '~/types';\n\nexport default ${JSON.stringify(page, null, '\t')} satisfies ApiReferenceTagPage;\n`,
		);
	}

	await cleanOldTagFiles(validFiles);

	await writeIfChanged(
		join(outputDir, 'meta.ts'),
		`// Generated by scripts/generate-api-reference.ts\n\nexport const apiReferenceMeta = ${JSON.stringify({ version: openapi.info.version }, null, '\t')} as const;\n\nexport const apiReferenceNavigation = ${JSON.stringify(navigation(byTag), null, '\t')} as const;\n`,
	);

	await writeIfChanged(
		join(outputDir, 'routes.json'),
		`${JSON.stringify(routes, null, '\t')}\n`,
	);

	console.log(`Generated API reference data for ${routes.length} tags`);
}

await main();
