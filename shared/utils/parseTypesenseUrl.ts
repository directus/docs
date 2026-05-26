export interface TypesenseNode {
	host: string;
	port: number;
	protocol: string;
	path: string;
}

export function parseTypesenseUrl(url: string): TypesenseNode {
	try {
		const parsedUrl = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
		return {
			host: parsedUrl.hostname,
			port: Number.parseInt(parsedUrl.port, 10) || (parsedUrl.protocol === 'https:' ? 443 : 8108),
			protocol: parsedUrl.protocol.replace(':', ''),
			// Empty string (not undefined) so the official Typesense client's
			// `${protocol}://${host}:${port}${path}${endpoint}` URL builder
			// doesn't interpolate the literal "undefined".
			path: parsedUrl.pathname === '/' ? '' : parsedUrl.pathname,
		};
	}
	catch (error) {
		throw new Error(`Invalid Typesense URL: ${url}`, { cause: error });
	}
}
