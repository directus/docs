## Using Directus Internals

To access systems like permission checks and your collections, you can use internal Directus services, available through an API extension's `context` parameter.

::callout{icon="material-symbols:menu-book-outline" color="purple" to="/guides/extensions/api-extensions/services"}
Learn more about using internal Directus services.
::

## Error Handling

To create errors in API extensions, you can utilize the [`@directus/errors`](https://www.npmjs.com/package/@directus/errors) package which is available to all extensions without installation.

```js
import { createError } from '@directus/errors';

const ForbiddenError = createError('FORBIDDEN', "You don't have permissions to see this.", 403);

throw new ForbiddenError();
```
