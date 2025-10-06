## Using Directus Internals

To access systems like permission checks and your collections, you can use internal Directus services, available through an API extension's `context` parameter.

::callout{icon="material-symbols:menu-book-outline" color="primary" to="/guides/extensions/api-extensions/services"}
Learn more about using internal Directus services.
::

## Error Handling

To create errors in API extensions, you can utilize the [`@directus/errors`](https://www.npmjs.com/package/@directus/errors) package which is available to all extensions without installation.

```js
import { createError, ForbiddenError } from '@directus/errors';

const CustomError = createError('CUSTOM', "This is a custom error.", 418);

throw new ForbiddenError();
throw new CustomError();
```
