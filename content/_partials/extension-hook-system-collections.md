::callout{icon="material-symbols:info-outline"}
**System Collections**

- `<system-collection>` should be replaced with the system collection name without the `directus_` prefix. For example, listening for new records in the `directus_users` collection becomes `users.create`.

**Exceptions**

- The `collections` and `fields` system collections do not emit a `read` event. The `files` collection does not emit a `create` or `update` event on file upload. The `relations` collection does not emit a `delete` event.

::
