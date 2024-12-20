import uiColors from '#ui-colors';

function getInitials(str: string) {
	return str
		.split(' ')
		.map(word => word.charAt(0))
		.join('');
}

function hashStr(str: string) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}

/**
 * Get a UI color for a given string
 *
 * This uses a deterministic hash to retrieve a semi-random color to ensure server and client
 * rendering result in the same color name when given the same string
 *
 * It'll take the first letter of every word, generate a hash out of that, and use that hash to grab
 * the color out of the array of UI colors. This ensures that phrases starting with the same word don't
 * necessarily get the same color
 */
export default function (str: string): typeof uiColors[number] {
	const hash = hashStr(getInitials(str));
	const index = hash % uiColors.length;
	return uiColors[index]!;
}
