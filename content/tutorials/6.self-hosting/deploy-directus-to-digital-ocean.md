---
id: 0398217e-fabe-4866-9827-d5e4172fe3a9
slug: deploy-directus-to-digital-ocean
title: Deploy Directus to Digital Ocean
technologies:
  - digitalocean
authors:
  - name: Matthew Ruffino
    title: Guest Author
description: Learn how to deploy Directus on the Digital Ocean App Platform.
---
This guide shows you how to deploy Directus on the DigitalOcean App Platform with a separate database, object storage, and optional Redis-based synchronization.

DigitalOcean App Platform is a good fit if you already use DigitalOcean and want a managed app runtime while still controlling your database, storage, and deployment configuration.

If you want a fully managed Directus deployment with infrastructure and upgrades handled for you, use [Directus Cloud](https://directus.io/pricing/cloud).


## Before You Start

As well as the DigitalOcean app that runs Directus, there are several additional requirements to run a production Directus project within the DO App platform:

- **Managed Database** - You will need a database for Directus. This can be hosted either within the DO ecosystem or externally.
- **Redis Droplet** - If you plan to have a clustered app, you must set up a Redis droplet to synchronize across multiple instances.
- **DigitalOcean Spaces** - Directus supports any S3-compatible file storage, and DO Spaces is exactly this.

You may not need a Redis droplet in development, but a clustered environment is something you may need to consider as your application scales.

## Create a Dockerfile Repository

DigitalOcean can deploy an application from a Dockerfile hosted in a GitHub or GitLab repository. Create a new repository and add a single file called `Dockerfile`:

```
# syntax=docker/dockerfile:1.4
FROM directus/directus:11.17.0
USER root
RUN corepack enable \
&& corepack prepare pnpm@8.7.6 --activate \
&& chown node:node /directus
EXPOSE 8055
USER node
CMD : \
&& node /directus/cli.js bootstrap \
&& node /directus/cli.js start;
```

- It's recommended to specify a version of the Directus image. If this is omitted, the latest version will always be used, which could cause errors if there are any breaking changes. You can update the version here to update Directus.
- Corepack is enabled as it allows us to use the pnpm package manager (used by Directus) without installing it.
- Chown gives the proper permissions needed for node to access the files.
- Port 8055 is exposed, which DigitalOcean will read and handle automatically during deployment.
- The bootstrap command is run to pull info from the ENV to either install the database (if it's empty) or migrate it to the latest version (if it already exists and has missing migrations).

## Create a Managed Database

If you already have an existing database, you don't have to create a new one now and can move on to the next section.

DigitalOcean offers hosted [databases](https://cloud.digitalocean.com/databases). Create a new one (I recommend starting with PostgreSQL) and take note of the connection details.

## Create a Redis Droplet

If you are setting up a production environment, you should now set up a Redis droplet for synchronization across containers. Follow this [DigitalOcean tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04). If you already have an existing Redis server, you can use that.

Directus currently does not support clustered Redis. If this changes, this process will become easier as this setup can use DO's Managed Redis service.

## Setup DigitalOcean Spaces Object Storage:

Persistent file uploads require an external storage volume. On the DigitalOcean App Platform, this means using the Spaces Object Storage, which has a S3-compatible API.

[Set up DigitalOcean Spaces here](https://cloud.digitalocean.com/spaces).

## Create a Directus App

1. In your DigitalOcean dashboard, navigate to the Apps section and click **Create App**.
2. Link the repository with your Dockerfile that you created earlier. You may need to connect your account to GitHub/GitLab to access your repository.
3. You'll encounter a page with an auto-generated name for your app. You should see the name of your repository below. This setup is recognized as a web service suitable for Directus.
4. Adjust the app's plan to your requirements, including the number of containers and their capabilities.
5. Connect to the managed database you crafted earlier. Attaching the database to the app is a recommended best practice, ensuring smooth firewall and security settings. Then, select your database cluster and user.
6. Input the necessary [environment variables](/configuration/general) for Directus. A set of basic variables will help you start, but ensure you complete all necessary fields. The bulk editor simplifies this task, and you can always return to edit or add more variables later.

```
SECRET="randomly-generated-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="hunter2"
DB_CLIENT="pg"
DB_HOST="dbhost"
DB_PORT="25060"
DB_DATABASE="your_db"
DB_USER="doadmin"
DB_PASSWORD="dbpass"
DB_SSL__CA=""
STORAGE_LOCATIONS=digitalocean
STORAGE_DIGITALOCEAN_DRIVER=s3
STORAGE_DIGITALOCEAN_KEY="your-storage-key"
STORAGE_DIGITALOCEAN_SECRET="your-storage-secret"
STORAGE_DIGITALOCEAN_ENDPOINT="your-storage-endpoint-url"
STORAGE_DIGITALOCEAN_BUCKET="your-storage-bucket-name"
STORAGE_DIGITALOCEAN_REGION="your-storage-region"
REDIS_HOST="host-ip"
REDIS_PORT="6379"
REDIS_PASSWORD="redis-password"
CACHE_ENABLED="true"
CACHE_STORE="redis"
CACHE_AUTO_PURGE="true"
MESSENGER_STORE="redis"
SYNCHRONIZATION_STORE="redis"
PUBLIC_URL=${APP_URL}
```

::callout{icon="material-symbols:info-outline"}

Generate `SECRET` with:

```bash
openssl rand -base64 32
```

::

For database connection settings, you can use DigitalOcean's predefined variables or the connection settings from the managed database page. Also include the CA certificate, available within the database connection settings. For more details on App Platform environment variables, see the [DigitalOcean documentation](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/).

Set `PUBLIC_URL` to the generated DigitalOcean app URL, or to your custom domain once you add one.

Once you've reviewed your configurations and confirmed everything's in order, click **Create App**. This will start the build and deployment.

## Deploy Your Project

Wait for the build and deployment to finish. DigitalOcean will build the image from your repository, start the Directus container, and keep that image available for later redeploys or autoscaling events.

When the deployment succeeds, open the app dashboard and copy the generated application URL. If you want to use a custom domain for your backend, add it in the app settings and then update `PUBLIC_URL` to match.

## Validation Checklist

Verify the setup:

- Open the generated app URL. Because `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, Directus should show the login screen instead of onboarding.
- Sign in with the admin credentials you configured and create and read an item in a test collection to confirm database connectivity.
- Upload a test file and confirm it appears in file storage.
- Restart or redeploy the app in DigitalOcean and verify Directus comes back online.
- If Spaces storage is configured, confirm that uploaded assets are stored in Spaces.

## Summary

You now have Directus running on DigitalOcean App Platform with a managed database, optional Redis, and optional Spaces storage. Changes to the Dockerfile or environment variables trigger new deployments, while your database and object storage remain separate from the app container.

If you need help, ask on the [community platform](https://community.directus.io).

## Handling PM2 Errors

If you're having issues with PM2 Errors when hosting Directus on Digital Ocean it may be due to `pidusage` (a dependency of `pm2`) struggling to run under their setup.

This issue can usually be circumvented by setting `PIDUSAGE_USE_PS` variable to `true`, but `pidusage` doesn't work with the version of `ps` the Directus image comes with.

Ideally, this would be addressed by the authors of `pidusage` or `pm2`, but this can work by building a customized image with a `ps` implementation `pidusage` works with and use that on Digital Ocean:

```dockerfile
FROM directus/directus:11.17.0

USER root
RUN apk --no-cache add procps
USER node

ENV PIDUSAGE_USE_PS=true
```
