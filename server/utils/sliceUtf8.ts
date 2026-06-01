export function sliceUtf8(text: string, offset: number, bytes: number): { content: string; nextOffset: number | null; truncated: boolean } {
	const buffer = Buffer.from(text, 'utf8');
	const start = Math.min(offset, buffer.length);
	let end = Math.min(start + bytes, buffer.length);
	let content = buffer.subarray(start, end).toString('utf8');
	while (end < buffer.length && content.endsWith('\uFFFD') && end > start) {
		end--;
		content = buffer.subarray(start, end).toString('utf8');
	}
	const consumed = Buffer.byteLength(content, 'utf8');
	const nextOffset = start + consumed < buffer.length ? start + consumed : null;
	return { content, nextOffset, truncated: nextOffset !== null };
}
