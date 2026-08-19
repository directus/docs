---
stableId: 1a7a7bd4-5b93-4373-9222-6acd54f3672a
id: 7c36b17a-9ea1-445a-9350-e6581b259826
slug: deploy-directus-to-pandastack
title: Deploy Directus to PandaStack
technologies:
  - pandastack
description: Deploy Directus to PandaStack as a Node application backed by a managed PostgreSQL database, using git-driven deploys with environment variables and a stable app URL.
---

PandaStack runs your application on a Firecracker microVM and provides managed PostgreSQL alongside it. You connect a Git repository, PandaStack installs and starts your app, and it serves the result behind a stable per-app URL. Because Directus is distributed as an npm package that speaks to an external database, you can run it on PandaStack as a plain Node application pointed at a PandaStack-managed PostgreSQL database.

This tutorial deploys Directus from a small repository containing a `package.json`, a `pandastack.json` build manifest, and a `mise.toml` runtime pin. PandaStack clones the repository, runs `npm install`, and starts Directus with `npx directus bootstrap && npx directus start`.

## Before You Start

- A [PandaStack](https://pandastack.ai) account.
- A GitHub account, so PandaStack can deploy from a repository (a public repository, or a private one connected through the PandaStack GitHub App).
- Basic familiarity with environment variables. You do not need Docker.

Directus 12 requires Node.js 22 or later and a supported database. This tutorial uses PandaStack's managed PostgreSQL, so there is nothing to install locally.

## Step 1: Create a managed PostgreSQL database

1. In the PandaStack dashboard, open **Databases** and select **Create**.
2. Choose a label (for example `directus`) and a size, then create the database. PandaStack provisions a dedicated PostgreSQL instance and, once it reaches a running state, shows its connection details.
3. Open **Quick connect** to read the connection values. The host looks like `<id>.db.pandastack.ai` and the port is `5432`; note the database name, user, and password as well. You will set these as Directus environment variables in Step 3.

PandaStack requires TLS for database connections, and the managed database presents a publicly trusted certificate. You will enable TLS in Directus with `DB_SSL=true`; no certificate file is needed.

::callout{icon="i-lucide-info" title="Keep the database reachable during deploys"}
PandaStack can suspend an idle database and wake it on the next connection. A first connection to a suspended database takes some time to wake, so on the very first deploy `directus bootstrap` may briefly fail with a database-connection error. Enable the **Always on** option for the database to avoid this, or redeploy once the database is running.
::

## Step 2: Prepare your repository

Create a new repository containing the following three files.

`package.json` declares Directus as the only dependency and defines a start script that runs migrations before serving:

```json
{
  "name": "directus-on-pandastack",
  "private": true,
  "engines": { "node": ">=22" },
  "dependencies": { "directus": "12.2.0" },
  "scripts": {
    "start": "directus bootstrap && directus start"
  }
}
```

`pandastack.json` tells PandaStack how to install and start the app:

```json
{
  "type": "node",
  "installCommand": "npm install",
  "startCommand": "npx directus bootstrap && npx directus start"
}
```

PandaStack starts the app with the `startCommand` from `pandastack.json`; the `package.json` `start` script mirrors it so the project also runs with `npm start` locally.

`mise.toml` pins the runtime versions:

```toml
[tools]
node = "22"
python = "3.11"
```

Pin `node` to `22`, the version Directus targets, and `python` to `3.11` so any native-module build succeeds. PandaStack reads `mise.toml` for runtime versions; an `.nvmrc` file is not used for this.

::callout{icon="i-lucide-info" title="Why pin the runtime"}
Directus depends on `isolated-vm`, which ships a prebuilt binary for Node 22. On a newer Node version without a matching prebuilt binary it compiles from source with `node-gyp`, which needs Python's `distutils` — removed in Python 3.12. Pinning Node 22 avoids that build entirely; the Python 3.11 pin keeps the fallback working if it ever runs.
::

`directus bootstrap` installs the Directus schema, runs migrations, and creates the first admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. It is idempotent: on later deploys it skips the install and only applies pending migrations, which is why it is safe to run on every start.

## Step 3: Create the app and set environment variables

1. In the PandaStack dashboard, open **Apps** and connect the repository from Step 2 (select it through the GitHub connection, or paste its public Git URL).
2. Once the app is created, its detail page shows a stable URL (`https://<app-id>.pandastack.ai`). Copy it — you will open it in Step 4 and use it as `PUBLIC_URL`.
3. Set the app's **Port** to `8055`, the port Directus listens on.
4. Add the following environment variables, using the connection values from Step 1 for the `DB_*` entries:

| Variable | Value | Notes |
| --- | --- | --- |
| `DB_CLIENT` | `pg` | Use the PostgreSQL client. |
| `DB_HOST` | your database host | From the database's connection details. |
| `DB_PORT` | `5432` | |
| `DB_DATABASE` | your database name | |
| `DB_USER` | your database user | |
| `DB_PASSWORD` | your database password | |
| `DB_SSL` | `true` | PandaStack requires TLS. |
| `KEY` | a random string | Unique project key. |
| `SECRET` | a random string | Signs access tokens; set a stable value so sessions survive restarts. |
| `ADMIN_EMAIL` | your admin email | Used by `directus bootstrap` to create the first admin. |
| `ADMIN_PASSWORD` | a strong password | |
| `HOST` | `0.0.0.0` | Bind all interfaces so PandaStack can reach the app. |
| `PORT` | `8055` | Must match the app's port. |

Generate `KEY` and `SECRET` as random values, for example with `openssl rand -base64 32` (run it once per value) or any UUID generator.

## Step 4: Deploy and verify

1. Trigger the deploy. PandaStack provisions the app's microVM, clones the repository, runs `npm install`, then starts Directus with `npx directus bootstrap && npx directus start`. You can follow the build and runtime logs in the dashboard.
2. On the first deploy, `directus bootstrap` connects to your managed database, runs the migrations, and creates the admin user. Directus then listens on port `8055`, and PandaStack's health check confirms the app is serving before making it live.
3. When the deploy is live, open the app's URL. Directus serves the Data Studio at the app root; visit `/admin/login` to reach the sign-in screen.
4. Log in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set. A successful login confirms Directus is reading and writing your managed PostgreSQL database.
5. Upload a test file under **Files** in the Data Studio. With S3 storage configured (see below), the file persists across deploys; with the default local storage, it is lost on the next deploy.

Set `PUBLIC_URL` to your app's URL (for example `https://your-app.pandastack.ai`) and redeploy so Directus uses the correct absolute address in login redirects, emails, and asset links.

## Optional: Durable file storage

By default Directus stores uploaded files on local disk (`STORAGE_LOCATIONS=local`). On a platform that replaces the app's filesystem between deploys, local uploads are not durable, so configure S3-compatible storage for production:

| Variable | Value |
| --- | --- |
| `STORAGE_LOCATIONS` | `s3` |
| `STORAGE_S3_DRIVER` | `s3` |
| `STORAGE_S3_KEY` | your access key ID |
| `STORAGE_S3_SECRET` | your secret access key |
| `STORAGE_S3_BUCKET` | your bucket name |
| `STORAGE_S3_REGION` | your bucket region |
| `STORAGE_S3_ENDPOINT` | your provider's endpoint (for non-AWS S3-compatible storage) |

See [Files configuration](/configuration/files) for the full list of storage options.

## Optional: Custom domain and TLS

PandaStack supports bring-your-own domains with automatic TLS:

1. In the app's settings in the PandaStack dashboard, add your custom domain.
2. Create the DNS record PandaStack shows at your DNS provider.
3. PandaStack provisions TLS for the domain once the DNS record resolves.
4. Update `PUBLIC_URL` to the custom domain (for example `https://directus.example.com`) and redeploy.

## Optional: Importing an existing database

If you are moving from another host, import a PostgreSQL dump into the managed database using its connection details from Step 1:

```bash
# For a plain SQL dump:
psql "postgresql://user:password@host:5432/database?sslmode=require" -f your_dump.sql

# For a custom-format dump from pg_dump -Fc:
pg_restore -d "postgresql://user:password@host:5432/database?sslmode=require" --clean --if-exists your_dump.dump
```

After importing, redeploy the app so Directus picks up the existing data. Log in with an admin user that already exists in the imported database, or keep `ADMIN_EMAIL` and `ADMIN_PASSWORD` set so `bootstrap` creates a new admin if the previous one is gone.

## Updating

To deploy new commits, push to the branch the app tracks; PandaStack redeploys automatically when auto-deploy is enabled. To update the Directus version, change the `directus` version in `package.json` and deploy. Because `directus bootstrap` runs on every start, pending migrations for the new version are applied automatically.

## Summary

You deployed Directus on PandaStack as a Node application backed by a managed PostgreSQL database. PandaStack installs the app from your repository and starts it with `npx directus bootstrap && npx directus start`, running migrations and creating the first admin on the first deploy. You set the `DB_*` connection variables (with `DB_SSL=true`), `KEY`, `SECRET`, and the admin credentials, pinned Node 22 with `mise.toml`, and configured S3 storage for durable uploads. For more on running Directus in production, see [Deploying Directus](/self-hosting/deploying) and [Configuration](/configuration/general).
