import { withoutLeadingSlash, withoutTrailingSlash } from 'ufo';

/**
 * Convert a page's path to an array of strings of it's path segments
 */
export default (path: string) => withoutLeadingSlash(withoutTrailingSlash(path)).split('/').slice(0, -1);
