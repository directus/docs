---
id: f8e7d6c5-b4a3-4921-9f8e-7d6c5b4a3920
slug: deploy-directus-to-render
title: Deploy Directus to Render
technologies:
  - render
description:
  Deploy Directus on Render using the official blueprint repository and one-click deploy flow. Provision services from
  Infrastructure-as-Code and finish configuration in the Render Dashboard.
---

Render hosts web services and managed databases and can deploy stacks defined as **Blueprints** (a `render.yaml` file in
a GitHub repository). The Directus team maintains an official blueprint repository so you can provision Directus and its
dependencies without building your own Docker Compose setup on Render.

Use the **Deploy to Render** button in the repository README to open Render with that repo selected, or connect the same
repo manually under **New** → **Blueprint** in the Render Dashboard. Details such as which databases and add-ons are
included live in the repo; treat the README there as the source of truth for required secrets and optional variables.

**Official repository:** [directus/render-blueprint-directus](https://github.com/directus/render-blueprint-directus)

**One-click deploy:**
[Deploy to Render](https://render.com/deploy?repo=https://github.com/directus/render-blueprint-directus)

## Before You Start

- A [Render](https://render.com) account with a supported payment method if your workspace requires paid instance types
  (Render documents current plans on their site).
- A GitHub account Render can use to pull the blueprint repository when you use one-click deploy.

> Note: the official blueprint defaults to Render's free plans. Local uploads are ephemeral on the free web service, and
> free Postgres/Key Value plans are subject to Render usage limits. Use a paid web service with persistent disk or
> external storage for durable file uploads.

## Step 1: Deploy the blueprint

1. Open [directus/render-blueprint-directus](https://github.com/directus/render-blueprint-directus) and follow the
   **Deploy to Render** link in the README (or use the one-click URL above).
2. Sign in to Render when prompted and authorize GitHub access if Render asks for repository permissions.
3. Render loads the Blueprint from the repo. Review the resources it will create (for example a web service running the
   Directus Docker image and a PostgreSQL instance). Confirm names, regions, and instance sizes match what you want for
   production or staging.
4. Complete any required fields Render surfaces during Blueprint setup. These often map to environment variables or
   secrets listed in the repository README (for example `SECRET`, database passwords, or admin bootstrap values).
5. Start the deploy and wait until services reach a healthy state. The Directus web service receives a default
   `*.onrender.com` hostname unless you configure a custom domain later.

If you prefer not to use the button, in the Render Dashboard choose **New** → **Blueprint**, select the same GitHub
repository, then apply the Blueprint with the same review step.

> Note: the official blueprint uses a `Dockerfile` to build the Directus image. To update the Directus version, change
> the image tag in that `Dockerfile`.

## Step 2: Configure environment variables

After resources exist, finish Directus configuration in the Render Dashboard.

1. Open the **Environment** (or **Environment Variables**) section for the Directus web service.
2. Set **`PUBLIC_URL`** to the URL clients use to reach Directus (for example `https://your-service.onrender.com` or
   your custom domain). Directus uses this for redirects, emails, and asset URLs. `PUBLIC_URL` is not required for the
   default `*.onrender.com` URL, but you should set it when using a custom domain.
3. The blueprint typically generates `SECRET` automatically. Set **`SECRET`** manually only if you want a deterministic
   value under your own control. See [general configuration](/configuration/general) for other optional variables.
4. Align remaining variables with the blueprint README: database connection values are often wired automatically when
   Postgres is created in the same Blueprint, but Redis, file storage, or cache settings may need explicit values
   depending on how the stack is defined.

Whenever you change environment variables, Render redeploys the web service so the container picks up new values.

::callout{icon="material-symbols:info-outline" title="First admin user"} You can rely on the Studio onboarding flow the
first time you open Directus, or pre-create an admin with [`ADMIN_*` variables](/configuration/general#first-admin-user)
if your blueprint documents them. Follow whichever path the repository README recommends for that stack. ::

## Step 3: Open Directus and verify

1. Visit your service URL in a browser (the same value you used for `PUBLIC_URL`).
2. Complete onboarding or log in with the admin credentials you configured.
3. Upload a test file if your blueprint uses local disk or external storage, so you confirm uploads persist across
   redeploys.

## Optional: Custom domain and TLS

1. In the Directus web service on Render, open **Settings** and find **Custom Domain**.
2. Add your domain and apply the DNS records Render shows (typically CNAME or A records).
3. Render provisions TLS automatically once DNS validates.
4. Update **`PUBLIC_URL`** to match the custom domain (for example `https://directus.example.com`).

## Updating the stack

When the blueprint repository changes (for example an updated `render.yaml` or pinned Directus image tag), sync or
reconnect the Blueprint from the Render Dashboard so Render proposes infrastructure updates. Read Render's
[Blueprint documentation](https://render.com/docs/infrastructure-as-code) for merge and rollout behavior in your
workspace.

## Summary

You deployed Directus on Render by applying the official blueprint, letting Render provision the services defined in
`render.yaml`, and setting environment variables such as `PUBLIC_URL` and `SECRET`. For deeper deployment concepts
(version pinning, persistence, health checks), see [Deploying Directus](/self-hosting/deploying) and
[Configuration](/configuration/general).
 