---
id: cloudflare-deployments
title: Deployments
description: Trigger Workers Builds, track deployment status, and view logs for Cloudflare Workers from Directus.
technologies:
  - cloudflare
---

After linking your Cloudflare account and selecting Workers, manage deployments from the **Deployment** module.

**[← Back to Cloudflare Workers Integration](/guides/integrations/cloudflare-workers)**

## Triggering Deployments

1. Open **Deployment**.
2. Choose **Cloudflare Workers**.
3. Select the Worker you want to build.
4. Open the **Deploy** menu (top right):
   - **Deploy**: triggers a build via the configured production flow (Workers Builds / trigger).
   - **Deploy via …**: appears when you saved **Deploy Hook** entries; POSTs to that hook URL.
   - **Refresh**: reloads runs and project data from Cloudflare.

A new run appears in the list with the provider's build identifier when available.

## Monitoring Deployment Status

In the runs list, you will typically see:

- **Deployment ID**: Cloudflare's identifier for the build.
- **Status**: for example **Building**, **Ready**, **Failed**, **Canceled** (per Directus labels).
- **Target**: for example production, when Cloudflare exposes it.
- **Started**: when the build started.
- **Author**: who triggered the deployment when known.

Status updates automatically. Use **Refresh** on the list or run detail if a status is not updating.

## Viewing Build Logs

1. Open a deployment from the Worker's run list.
2. Review logs as Cloudflare returns them (timestamps and log levels as shown in the UI).
3. **Search** and filter by log level where available.
4. **Download** logs if you need a file copy.

## Exporting Logs

1. Open the deployment detail view.
2. Use **Download** (or the download control shown in the toolbar) to save logs.

## Visiting Builds in Cloudflare

From deployment details, use **Visit** or **Open in Cloudflare Workers** (wording per Directus version) to open the build or dashboard in Cloudflare when a URL is available.

## Canceling a Deployment

If the run is still active and Cloudflare allows canceling it, the detail view may offer **Stop** or cancel with a confirmation. If the action is not available, cancel from the Cloudflare dashboard.

## Best Practices

**Deployment Workflow**

- Complete Workers Builds setup (Git repository and build trigger) in Cloudflare before deploying from Directus.
- Deploy after publishing content changes that affect your Worker or site.
- Monitor initial deployments after setup to confirm builds complete successfully.

**Troubleshooting**

- For failed runs, review build logs first, then verify build settings and API token permissions in Cloudflare.
- Rotate API tokens in Cloudflare and update Directus when you revoke old tokens.

## Next Steps

- **[← Back to Cloudflare Workers Integration](/guides/integrations/cloudflare-workers)**
- **[Deployment Security](/guides/deployments/security)**: roles and access control
- **[Vercel Integration](/guides/integrations/vercel)** and **[Netlify Integration](/guides/integrations/netlify)**: other supported deployment providers
