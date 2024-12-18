/**
 * Transform GitHub's Linguist language name to a valid shiki highlighter name.
 *
 * @directus/openapi uses the redocly spec for x-codeSamples, which uses linguist. This util can be used to
 * render code blocks with highlighting from those names
 *
 * @see https://github.com/github-linguist/linguist/blob/main/lib/linguist/popular.yml
 * @see https://github.com/shikijs/textmate-grammars-themes/tree/main/packages/tm-grammars/grammars
 */
export default function linguistToShiki(linguistLang: string): string {
	switch (linguistLang) {
		case 'JavaScript': return 'js';
		case 'GraphQL': return 'graphql';
		default: return linguistLang;
	}
}
