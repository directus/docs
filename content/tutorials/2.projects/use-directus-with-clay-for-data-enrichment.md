---
id: 8da0ec5c-4865-41fd-a4fe-073e354af16b
title: Use Directus with Clay for Data Enrichment
description: Connect Directus with Clay to automate data enrichment and sync content between platforms using webhooks and HTTP API templates.
technologies:
  - clay
---

Connect your Directus instance with Clay to automate data enrichment, sync content, and build powerful workflows between your content platform and Clay's data enrichment tools.

## Before You Start

### Set Up Your Directus Project

You'll need a Directus project with:

- Collections set up with the data you want to work with
- Proper permissions configured for the operations you plan to use
- API access enabled and a valid API token

If you don't already have a Directus project, the easiest way to get started is with our [managed Directus Cloud service](https://directus.cloud).

### Set Up Clay

Make sure you have a Clay account and are familiar with:

- Creating enrichment columns
- Basic Clay workflow concepts
- How to search for and use templates

::ProseImg{src="/img/tutorials/directus_clay_integration.png" alt="Directus Clay Integration Overview" width="400" class="mx-auto"}
::

## How to Connect Directus and Clay

There are two separate ways to connect Directus and Clay, each with different setup processes:

### Option 1: Clay → Directus (HTTP API Templates)

Use Clay's pre-built HTTP API templates to pull data from Directus for enrichment or push enriched data back. Ideal for on-demand operations.

**[📖 Learn how to use Clay Templates with Directus →](/tutorials/projects/use-clay-templates-with-directus)**

### Option 2: Directus → Clay (Webhooks)

Use Directus Flows to automatically send data to Clay webhooks when events occur in your instance. Perfect for real-time data sync.

**[📖 Learn how to use Directus Webhooks with Clay →](/tutorials/projects/use-directus-webhooks-with-clay)**

## Advanced Topics

Once you're comfortable with the basic integration methods, explore these advanced topics:

**[🔧 Working with Directus Data Operations →](/tutorials/projects/directus-clay-data-operations)**

This covers:

- Understanding filters and query parameters
- Field selection and pagination
- Common use cases and workflows
- Troubleshooting and getting help

## Quick Start Guide

**New to Clay?** Start with [Clay Templates](/tutorials/projects/use-clay-templates-with-directus) - they're easier to set up and great for learning the basics.

**Need real-time sync?** Jump to [Directus Webhooks](/tutorials/projects/use-directus-webhooks-with-clay) for automatic data synchronization.

**Ready for advanced features?** Explore [Data Operations](/tutorials/projects/directus-clay-data-operations) for complex workflows and optimization.

---

## Additional Resources

- [Clay Documentation](https://clay.com/docs)
- [Directus Community](https://community.directus.io/)
