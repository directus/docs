## Error Handling

To create errors in API extensions, you can utilize the [`@directus/errors`](https://www.npmjs.com/package/@directus/errors) package which is available to all extensions without installation.

```js
import { createError } from '@directus/errors';

const ForbiddenError = createError('FORBIDDEN', "You don't have permissions to see this.", 403);

throw new ForbiddenError();
```