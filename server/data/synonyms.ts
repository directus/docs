/**
 * Search synonyms for Typesense, pushed by `pnpm index`.
 *
 * Two flavors:
 *
 * 1. `multiway`: equivalent terms. Searching ANY term in the group matches
 *    docs containing ANY OTHER term in the group. Use for true synonyms where
 *    direction doesn't matter.
 *
 *    Add a new entry by appending an array of equivalent terms:
 *      ['perms', 'permissions']
 *      ['login', 'sign in', 'log in']
 *
 * 2. `oneway`: directional. Searching the KEY surfaces docs containing the
 *    VALUE, but NOT the reverse. Use when a shorthand should reach the
 *    canonical Directus term, but the canonical term shouldn't be polluted
 *    with shorthand mentions.
 *
 *    Add a new entry as `'<what user types>': '<what to match in docs>'`:
 *      table: 'collection'   // searches for "table" find collection docs
 *      db: 'database'        // searches for "db" find database docs
 *
 * Notes:
 * - Don't add pure case variants (Typesense case-folds by default).
 * - Don't add stemming pairs like aggregate/aggregation (Typesense stems).
 * - When in doubt, leave it out. Bad synonyms hurt search worse than missing ones.
 */

export const multiway: ReadonlyArray<readonly string[]> = [
	['auth', 'authentication'],
	['env var', 'environment variable'],
	['OAS', 'OpenAPI'],
	['M2M', 'many-to-many'],
	['M2O', 'many-to-one'],
	['O2M', 'one-to-many'],
	['O2O', 'one-to-one'],
	['M2A', 'many-to-any'],
	['realtime', 'websockets'],
	['js', 'javascript'],
	['ts', 'typescript'],
	['ui', 'user interface'],
	['login', 'sign in', 'log in'],
	['logout', 'sign out', 'log out'],
	['register', 'sign up'],
	['relation', 'relationship'],
	['junction collection', 'join table'],
	['query param', 'query parameter'],
	['self-host', 'self-hosted', 'self-managed'],
	['static token', 'personal access token'],
	['webhook', 'event hook'],
	['revision', 'version history'],
];

export const oneway: Readonly<Record<string, string>> = {
	table: 'collection',
	column: 'field',
	row: 'item',
	record: 'item',
	db: 'database',
};
