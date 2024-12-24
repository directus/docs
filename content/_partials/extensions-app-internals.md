## Using Directus Internals

To access internal systems like the API or the stores in app extensions, you can use the `useApi()` and `useStores()` composables exported by the `@directus/extensions-sdk` package.

::callout{icon="material-symbols:menu-book-outline" color="purple" to="/guides/extensions/app-extensions/composables"}
Learn more about using Directus composables.
::

Directus UI components are globally registered, making them accessible throughout your extension without the need to import them.

::callout{icon="material-symbols:menu-book-outline" color="purple" to="/guides/extensions/app-extensions/ui-library"}
Learn more about using the Directus UI library.
::

## Using External APIs

To avoid Cross Site Request Forgery (CSRF), app extensions cannot make requests to external servers by default. A common approach to achieve this is to create a bundle containing an endpoint that makes the external request, and an app extension that uses the now-internal endpoint to retrieve data.

::callout{icon="material-symbols:school-outline" color="pink" to="/tutorials/extensions"}
Learn more about building extensions through our tutorials.
::
