---
id: deploy-directus-to-northflank
slug: deploy-directus-to-northflank
title: Deploy Directus to Northflank
technologies:
  - northflank
description: Deploy a production-ready Directus instance on Northflank using the official one-click stack, with PostgreSQL, Redis, and MinIO storage provisioned automatically.
---

Northflank is a cloud platform for deploying containerized applications and their dependencies. The official Directus stack provisions a complete environment in one click: a Directus service, a PostgreSQL database, a Redis cache, and a MinIO addon for S3-compatible file storage. Northflank wires the services together and manages scaling, networking, and SSL for you.

## Before You Start

- A [Northflank](https://northflank.com) account (sign up free). Some features require a paid plan - check [Northflank pricing](https://northflank.com/pricing) before deploying to production.

## Step 1: Deploy the stack

1. Open the [Directus stack on Northflank](https://northflank.com/stacks/deploy-directus) and click **Deploy Directus now**.
2. Log in to your Northflank account if prompted.
3. Click **Deploy stack** to provision the template. Northflank will create a new project containing:
   - A **Directus** service running the official Docker image
   - A **PostgreSQL** addon for the primary database
   - A **Redis** addon for caching and session management
   - A **MinIO** addon for S3-compatible file and media storage
   - A **secret group** to manage environment variables and credentials
4. Wait for all addons and the Directus service to reach a running state. You can monitor progress in the project dashboard.

## Step 2: Find your Directus URL

1. In the Northflank dashboard, open your new project and click the **Directus** service.
2. Go to the **Domains** tab (or **Networking** section). Northflank automatically assigns a public URL in the format `your-service.code.run`.
3. Copy that URL. You'll use it as the value for `PUBLIC_URL` so Directus can generate correct links, handle login redirects, and serve assets.

If you want a custom domain, you can add one from the same **Domains** tab - see [Optional: Custom domain and SSL](#optional-custom-domain-and-ssl).

## Step 3: Set environment variables

The stack pre-configures the database, Redis, and MinIO connections automatically by injecting variables from the secret group. You'll need to set a few additional values manually.

1. In the project dashboard, open the **Directus** service.
2. Go to the **Environment** tab (or open the secret group linked to the service).
3. Set the following variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `PUBLIC_URL` | `https://your-service.code.run` | Use the URL from Step 2. Required for redirects, emails, and asset links. |
| `ADMIN_EMAIL` | `admin@example.com` | The email for your first admin account. |
| `ADMIN_PASSWORD` | A strong password | The password for your first admin account. |

4. Save your changes. Northflank will redeploy the Directus service with the new values.

::callout{icon="material-symbols:info-outline" title="Pre-configured variables"}
The stack automatically injects the database connection, Redis URL, MinIO/S3 storage credentials, and a generated `SECRET` key from the secret group. You do not need to set those manually unless you're replacing a Northflank addon with an external service.
::

## Step 4: Log in and verify

1. Open your Directus URL in a browser.
2. If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, log in with those credentials.
3. If you left them unset, Directus will show the onboarding screen on first visit where you can create your first admin user.
4. Once logged in, you can create collections, upload files, and start building.

File uploads are stored in the MinIO addon and will persist across redeploys.

## Optional: Custom domain and SSL

1. In the Northflank dashboard, open the **Directus** service and go to the **Domains** tab.
2. Add your domain (e.g. `directus.yourdomain.com`).
3. Northflank will provide a CNAME record. Add it to your DNS provider.
4. Northflank provisions SSL automatically once DNS has propagated.
5. Update `PUBLIC_URL` in your environment variables to the new domain (e.g. `https://directus.yourdomain.com`) so Directus uses it in links and redirects.

## Next Steps

- [Configuration](/configuration/general) — all available Directus environment variables
- [Deploying Directus](/self-hosting/deploying) — general self-hosting guidance and production recommendations
- [File Storage](/configuration/file-storage) — configuring or swapping the storage adapter
