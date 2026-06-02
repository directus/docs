---
stableId: f7cdd8ab-baa4-4ac8-9766-b3de39435ecc
id: deploy-directus-to-northflank
slug: deploy-directus-to-northflank
title: Deploy Directus to Northflank
technologies:
  - northflank
description: Deploy a production-ready Directus instance on Northflank using the official one-click stack, with PostgreSQL, Redis, and MinIO storage provisioned automatically.
---

Northflank is a cloud platform for deploying containerized applications and their dependencies. The official Directus stack provisions a complete environment in one click: a Directus service, a PostgreSQL database, a Redis cache, and a MinIO addon for S3-compatible file storage. Northflank wires the services together and manages scaling, networking, and SSL for you.

## Before You Start

- A [Northflank](https://northflank.com) account with a **payment method on file**. The Directus stack provisions three addons (PostgreSQL, Redis, and MinIO) using the `nf-compute-50` compute plan, which requires a payment method even on the free tier. Add one in your Northflank billing settings before you start.

## Step 1: Deploy the stack

1. Open the [Directus stack on Northflank](https://northflank.com/stacks/deploy-directus) and click **Deploy Directus now**.
2. Log in to your Northflank account if prompted.
3. Enter an `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The template requires both before it will deploy, and uses them to create your first admin account.
4. Click **Deploy stack**. Northflank creates a new project containing:
   - A **Directus** service running the official Docker image
   - A **PostgreSQL** addon for the primary database
   - A **Redis** addon for caching and session management
   - A **MinIO** addon for S3-compatible file and media storage
   - A **secret group** to manage environment variables and credentials
5. Wait for all addons and the Directus service to reach a running state. You can monitor progress in the project dashboard.

![Northflank workflow view showing the Directus stack: a project node followed by three parallel addon nodes for DirectusDB (PostgreSQL), DirectusRD (Redis), and DirectussS3 (MinIO).](/img/northflank-template.png)

## Step 2: Find your Directus URL

1. In the Northflank dashboard, open your project and go to the **Services** tab.
2. Click the **Directus** service. Once the deployment completes, your public URL appears in the top right of the service page in the format `your-service.code.run`.
3. Copy that URL. You will use it as the value for `PUBLIC_URL` so Directus can generate correct links, handle login redirects, and serve assets.

If you want a custom domain, see [Optional: Custom domain and SSL](#optional-custom-domain-and-ssl).

## Step 3: Set your public URL

Now that the deployment is running, set `PUBLIC_URL` so Directus knows its public address. This is required for login redirects, emails, and asset links.

1. In the project dashboard, open the secret group linked to the Directus service.
2. Set `PUBLIC_URL` to the URL from Step 2 (e.g. `https://your-service.code.run`).
3. Save your changes. Northflank will redeploy the Directus service with the updated value.

::callout{icon="material-symbols:info-outline" title="Pre-configured variables"}
The stack automatically injects the database connection, Redis URL, MinIO/S3 storage credentials, and a generated `SECRET` key from the secret group. You do not need to set those manually unless you're replacing a Northflank addon with an external service.
::

## Step 4: Log in and verify

1. Open your Directus URL in a browser.
2. Log in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set during deployment.
3. Once logged in, you can create collections, upload files, and start building.

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
- [File Storage](/configuration/files) — configuring or swapping the storage adapter
