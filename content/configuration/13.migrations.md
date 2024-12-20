---
title: Migrations
description: Creation of custom migration files to automate database changes.
---

Directus allows adding custom migration files that run whenever the migration commands are run.

| Variable          | Description                          | Default Value  |
| ----------------- | ------------------------------------ | -------------- |
| `MIGRATIONS_PATH` | Where custom migrations are located. | `./migrations` |

The file name follows the following structure `[identifier]-[name].js`, for example `20201202A-my-custom-migration.js`.

Every file in the root of the `migrations` directory is treated as a migration. Files that don't include a `-` character are ignored. If you want to rely on shared helper functions between migrations, put them in a subdirectory so they aren't loaded in by the migrations helper.

## Structure

Migrations have to export an `up` and a `down` function. These functions get a [Knex](http://knexjs.org) instance that can be used to do virtually whatever.

```js
export async function up(knex) {
	await knex.schema.createTable('test', (table) => {
		table.increments();
		table.string('rijk');
	});
}

export async function down(knex) {
	await knex.schema.dropTable('test');
}
```

::callout{icon="material-symbols:warning-rounded" color="amber"}
**Backup Your Database**  
Proceed at your own risk and backup your database before adding custom migrations.
::

## Migrations and Directus Schema

Migrations can be used to manage the contents of Directus collections (e.g. initial hydration). In order to do it, you must ensure that the schema is up to date before running your migrations.

`directus database migrate:latest` runs the required Directus internal migrations and the migrations from the `migrations` directory. In general, you need the following flow:

```sh
# Option 1
npx directus bootstrap
npx directus schema apply ./path/to/snapshot.yaml

# Option 2 - without bootstrap, you must ensure that you run all required `bootstrap` tasks
npx directus database install
npx directus database migrate:latest
npx directus schema apply ./path/to/snapshot.yaml
```

To correctly follow this process, the `migrations` directory must not contain tasks that modify the contents of Directus system collections, because schema may not yet be created when you run `migrate:latest`.
