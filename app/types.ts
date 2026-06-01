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

export interface ApiReferenceCodeSample {
	label: string;
	lang: string;
	source: string;
}

export interface ApiReferenceParameter {
	name?: string;
	description?: string;
	schema?: {
		type?: string;
	};
}

export interface ApiReferenceRequestBody {
	description?: string;
	schema: FlattenedParam | null;
}

export interface ApiReferenceResponse {
	code: string;
	description?: string;
	schema: FlattenedParam | null;
}

export interface ApiReferenceOperation {
	method: string;
	path: string;
	summary?: string;
	description?: string;
	parameters: ApiReferenceParameter[];
	requestBody: ApiReferenceRequestBody | null;
	responses: ApiReferenceResponse[];
	responseExample: unknown | null;
	'x-codeSamples'?: ApiReferenceCodeSample[];
}

export interface ApiReferenceTagPage {
	tag: {
		name: string;
		description?: string;
	};
	operations: ApiReferenceOperation[];
}
