import type { OperationObject, ParameterObject } from 'openapi3-ts/oas30';

export type DerefedOperationObject<O = OperationObject> = O & { parameters: ParameterObject[] };
export type FlattenedOperationObject<O = OperationObject> = O & { method: string; path: string };

export interface FlattenedParam {
	name: string | undefined;
	type: string | undefined;
	description: string | undefined;
	children?: FlattenedParam[];
	anyOf?: FlattenedParam[];
}
