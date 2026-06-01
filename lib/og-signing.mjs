export function encodeComponent(value) {
	return encodeURIComponent(String(value).normalize('NFC')).replace(/[!'()*]/g, (char) =>
		`%${char.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

export function canonicalQueryFromEntries(entries, options = {}) {
	return [...entries]
		.filter(([key, value]) => value !== undefined && value !== null && (!options.omitSignature || key !== 'sig'))
		.map(([key, value]) => [encodeComponent(key), encodeComponent(value)])
		.sort(([a], [b]) => {
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		})
		.map(([key, value]) => `${key}=${value}`)
		.join('&');
}

export function canonicalPayloadFromEntries(template, version, entries, options = {}) {
	return `v=${version}\ntemplate=${template}\n${canonicalQueryFromEntries(entries, options)}`;
}
