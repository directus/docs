---
id: 7c8e9f0a-1b2c-4d5e-8f9a-0b1c2d3e4f5a
slug: deploy-directus-to-railway
title: Deploy Directus to Railway
technologies:
  - railway
description: Deploy Directus on Railway using the official one-click templates (blank instance or CMS template) with PostgreSQL, Redis, and S3-compatible storage.
---

Railway is a platform that runs your app and its dependencies (databases, cache, storage) in one place. You don't manage servers or containers yourself; you deploy from a template or connect a repo, set variables, and Railway handles the rest. 

We maintain two one-click templates on Railway:

- **[Directus (blank)](https://railway.com/deploy/directus-official)** A fresh Directus instance with PostgreSQL, Redis, and S3-compatible bucket storage provisioned by the template. Use this when you want full control over your data model from scratch.
- **[Directus CMS](https://railway.com/deploy/directus-cms)** The same stack with our [CMS template](https://github.com/directus-labs/Directus-Railway-CMS-Template) applied: pre-configured collections for pages, articles, categories, authors, and related fields. Ideal for content-focused projects or when you're pairing Directus with a frontend starter (Next.js, Nuxt, Astro, SvelteKit).

Choose the template that fits, then follow the steps below. The flow is the same for both; only the starting template differs.

## Prerequisites

- A [Railway](https://railway.app) account (sign up with GitHub or email). Railway templates generally require a paid account (Hobby or Pro plan) for deployment.  You can also use them during your free trial of a paid plan.

## Step 1: Deploy from a template

1. Open either [Directus (blank)](https://railway.com/deploy/directus-official) or [Directus CMS](https://railway.com/deploy/directus-cms) and click **Deploy** (or **Deploy Now**).
2. If prompted, log in or create a Railway account. Railway will create a new **project** and add the template's services to it. A project is a group of services (Directus, database, Redis, bucket) that talk to each other on Railway's private network.
3. While the project is being set up, Railway may ask you to fill out some environment variables. For the **Directus CMS** template in particular, you'll typically be prompted for an admin email and password so the template can create your first admin user and apply the CMS schema. Enter values there, or you can add or change them later in the **Variables** tab (see Step 3).
4. Wait for the initial deploy to finish. In the project dashboard you'll see services such as **Directus**, **PostGIS** (PostgreSQL), **Redis**, and **Bucket**. Railway builds and runs the Directus image and wires it to the database, cache, and storage using variables it injects for you.

You don't need to clone a repo or run Docker yourself; the template defines the stack and Railway runs it.

## Step 2: Find your Directus service and URL

1. In the left sidebar of the project, click the **Directus** service (the one that runs the app, not PostGIS or Redis).
2. Open the **Settings** tab. Under **Networking**, you'll see **Public Networking**. Enable **Generate Domain** if it isn't already on. Railway will assign a URL like `your-service.up.railway.app`.
3. Copy that URL. You'll use it as `PUBLIC_URL` so Directus knows its public address (needed for login redirects, emails, and assets).

If you prefer a custom domain later, you can add it in the same **Networking** section; Railway will provision SSL for it.

## Step 3: Set environment variables

The templates preconfigure most of what Directus needs: database, Redis, and (when present) S3-compatible storage are wired up via Railway's internal references. You may still need to fill in or adjust some variables.

1. In the left sidebar, select the **Directus** service.
2. Open the **Variables** tab. Check that values like `PUBLIC_URL` (your app's public URL, e.g. `https://your-directus.up.railway.app`) are set correctly. For the **Directus CMS** template only, admin email and password are usually requested during the initial deploy (Step 1); you can also set or change `ADMIN_EMAIL` and `ADMIN_PASSWORD` here. The blank template does not use admin env vars; you create the first admin user in the UI when you first visit (Step 4).
3. If you plan to use the [frontend starters](https://github.com/directus-labs/starters) (Next.js, Nuxt, Astro, SvelteKit) with the **Directus CMS** template, there are additional variables to configure for that integration; see the template or starter docs for details.

After you save variables, Railway will redeploy the Directus service so the new values take effect. The first time you open your Directus URL, you'll either see the onboarding screen (blank template) or the login screen (CMS template, using the credentials you set).

::callout{icon="material-symbols:info-outline" title="Preconfigured variables"}
The official templates set database, Redis, and (with the Bucket service) S3 storage automatically. Only override those if you're using an external database or storage; otherwise focus on `PUBLIC_URL`. For the CMS template, you can also set `ADMIN_EMAIL` and `ADMIN_PASSWORD` if you didn't during deploy. The blank template creates the first admin via the UI, not env vars.
::

## Step 4: Log in and verify

1. Open your Directus URL in a browser (the one you set as `PUBLIC_URL`).
2. **Blank template:** The first time you visit, you'll see the Directus onboarding screen. Create your first admin user there (email and password); no environment variables are required for that flow.
3. **Directus CMS template:** Log in with the admin email and password you provided during the deploy (Step 1) or set in the **Variables** tab.
4. If you used the **Directus CMS** template, you should see the pre-configured collections (e.g. pages, articles, categories). If you used the blank template, you'll start with an empty project and can create collections as usual.

Uploads are stored in the template's S3-compatible bucket when the Bucket service is present, so file uploads will persist across redeploys.

## Optional: Custom domain and SSL

1. In the **Directus** service, go to **Settings** → **Networking**.
2. Under **Custom Domain**, add your domain (e.g. `directus.yourdomain.com`).
3. Railway shows the CNAME (or A record) you need. Add that record in your DNS provider.
4. Railway provisions SSL for the custom domain automatically. Once DNS has propagated, update `PUBLIC_URL` to the new domain (e.g. `https://directus.yourdomain.com`) so Directus uses it in links and redirects.

## Optional: Importing an existing database

If you're moving from another host (including Directus Cloud), you can import a PostgreSQL dump into the PostGIS service.

1. In the project, click the **PostGIS** (or PostgreSQL) service.
2. Open the **Connect** or **Data** tab and copy the connection string or host/port/user/password. Enable **TCP Proxy** in the service settings if you need to connect from your machine (e.g. with `psql` or a GUI).
3. From your computer, run your restore command with that connection string, for example:

```bash
# For a plain SQL dump:
psql "postgresql://user:password@host:port/railway" -f your_dump.sql

# For a custom-format dump from pg_dump -Fc:
pg_restore -d "postgresql://user:password@host:port/railway" --clean --if-exists your_dump.dump
```

Use the exact connection string Railway provides (host may be a proxy host if TCP proxy is enabled).

4. Restart the **Directus** service so it picks up the existing data. Log in with an admin user that already exists in the imported database, or set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create a new admin if the previous one was tied to the old environment.

## Summary

You deployed Directus on Railway by choosing one of our templates, letting Railway provision Postgres, Redis, and (optionally) S3-compatible storage, and setting a few required variables. The dashboard and Variables tab are where you'll adjust configuration and see logs; redeploys happen automatically when you change variables or the template updates. For more on running Directus in production, see [Deploying Directus](/self-hosting/deploying) and [Configuration](/configuration/general).
