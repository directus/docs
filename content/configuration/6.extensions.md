---
title: Extensions
description: Configuration for extensions and the Directus Marketplace.
---

:partial{content="config-env-vars"}

| Variable                               | Description                                                                     | Default Value  |
| -------------------------------------- | ------------------------------------------------------------------------------- | -------------- |
| `EXTENSIONS_PATH`<sup>[1]</sup>        | Path to your local extensions directory.                                        | `./extensions` |
| `EXTENSIONS_MUST_LOAD`                 | Exit the server when any API extension fails to load.                           | `false`        |
| `EXTENSIONS_AUTO_RELOAD`<sup>[2], [3]</sup> | Automatically reload extensions when they have changed.                         | `false`        |
| `EXTENSIONS_CACHE_TTL`<sup>[4]</sup>   | How long custom app Extensions get cached by browsers.                          |                |
| `EXTENSIONS_LOCATION`<sup>[5]</sup>    | What configured storage location to use for extensions.                         |                |
| `EXTENSIONS_LIMIT`                     | Maximum number of extensions you allow to be installed through the Marketplace. |                |

<sup>[1]</sup> If `EXTENSIONS_LOCATION` is configured, this is the path to the extensions directory within the selected
storage location.

<sup>[2]</sup> `EXTENSIONS_AUTO_RELOAD` will not work when the `EXTENSION_LOCATION` environment variable is set.

<sup>[3]</sup> `EXTENSIONS_AUTO_RELOAD` will likely not work on Windows machines without also setting the `CHOKIDAR_USEPOLLING` environment variable to `true`.

<sup>[4]</sup> The `EXTENSIONS_CACHE_TTL` environment variable controls for how long [app extensions](/guides/extensions/app-extensions) are cached by browsers. By default, extensions are not cached. 

<sup>[5]</sup> By default extensions are loaded from the local file system. `EXTENSIONS_LOCATION` can be used to load extensions from a storage location instead.

## Marketplace

| Variable               | Description                                       | Default Value                  |
| ---------------------- | ------------------------------------------------- | ------------------------------ |
| `MARKETPLACE_TRUST`    | One of `sandbox`, `all`                           | `sandbox`                      |
| `MARKETPLACE_REGISTRY` | The registry to use for the Directus Marketplace. | `https://registry.directus.io` |

::callout{icon="material-symbols:info-outline"}
**Sandbox**  
By default, the Directus Marketplace will allow installation of all [App extension types](/guides/extensions/app-extensions) and only [API extension types](/guides/extensions/api-extensions) that use our secure sandbox.
::
