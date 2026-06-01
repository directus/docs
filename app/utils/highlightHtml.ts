const MARK_OPEN = '\uE000';
const MARK_CLOSE = '\uE001';

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function sanitizeHighlightHtml(value: string) {
	return escapeHtml(
		value
			.replace(/<mark>/gi, MARK_OPEN)
			.replace(/<\/mark>/gi, MARK_CLOSE),
	)
		.replaceAll(MARK_OPEN, '<mark>')
		.replaceAll(MARK_CLOSE, '</mark>');
}
