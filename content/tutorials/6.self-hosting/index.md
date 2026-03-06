---
title: How to Deploy Directus
description: Deploy Directus with Directus Cloud, self-host with Docker, or follow step-by-step guides for your preferred cloud provider.
---

There are several ways to deploy Directus. This page outlines the main options: Directus Cloud (fully managed), self-hosting with Docker on your own infrastructure, and vendor-specific tutorials for popular cloud platforms.

## Directus Cloud

Directus Cloud provides infrastructure from the team who builds Directus. It is a fully managed service that handles data storage, hosting, updates, and scalability so you can focus on building your digital apps and experiences. Projects can be created in over 15 global deployment regions and feature autoscaling for improved availability. You can get a project running in about 90 seconds.

:cta-cloud

::callout{icon="material-symbols:school-outline" color="secondary" to="/cloud/getting-started/introduction"}
Learn more about Directus Cloud.
::

## Self-Host with Docker

Directus is provided as a Docker image, so you can deploy it on many different platforms. While each is slightly different, the core concepts are the same. You control the database, cache, and file storage. For a local or deployable setup, start with [Create a project](/getting-started/create-a-project). For environment variables, persistence, and production concepts, see [Deploying Directus](/self-hosting/deploying).

::callout{icon="material-symbols:school-outline" color="secondary" to="/getting-started/create-a-project"}
Create a project with Docker.
::

## Platform-Specific Guides

We also have step-by-step guides for self-hosting Directus on various cloud providers, including Amazon Web Services, Microsoft Azure, Google Cloud Platform, DigitalOcean, Ubuntu, and Railway. The tutorials below walk you through deploying on each platform (often including reverse proxy, SSL, and running as a service where relevant).
