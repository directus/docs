import { describe, expect, it } from 'vitest';
import { parseTypesenseUrl } from '../../shared/utils/parseTypesenseUrl';

describe('parseTypesenseUrl', () => {
	it('defaults bare hosts to https port 443', () => {
		expect(parseTypesenseUrl('search.example.com')).toEqual({
			host: 'search.example.com',
			port: 443,
			protocol: 'https',
			path: '',
		});
	});

	it('keeps custom protocol, port, and path', () => {
		expect(parseTypesenseUrl('http://localhost:8108/typesense')).toEqual({
			host: 'localhost',
			port: 8108,
			protocol: 'http',
			path: '/typesense',
		});
	});

	it('throws for invalid URLs', () => {
		expect(() => parseTypesenseUrl('http://')).toThrow('Invalid Typesense URL');
	});
});
