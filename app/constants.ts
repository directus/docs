import type {
	PathItemObject,
} from 'openapi3-ts/oas30';

export const methods: (keyof PathItemObject)[] = [
	'get',
	'put',
	'post',
	'delete',
	'options',
	'head',
	'patch',
	'trace',
] as const;
