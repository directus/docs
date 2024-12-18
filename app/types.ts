import type { OperationObject, ParameterObject } from 'openapi3-ts/oas30';

export type DerefedOperationObject<O = OperationObject> = O & { parameters: ParameterObject[] };
export type FlattenedOperationObject<O = OperationObject> = O & { method: string; path: string };
