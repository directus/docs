---
id: netlify-deployments
title: Deployments
description: Full guide for triggering builds, tracking deployment progress, and viewing logs for your Netlify sites from Directus.
technologies:
  - netlify
---

After linking your Netlify account and configuring your sites, manage all deployment activities directly from Directus.

Trigger deployments after publishing content updates that impact your frontend.

**[← Back to Netlify Integration](/guides/integrations/netlify)**

## Triggering Deployments

Start a new deployment for any connected Netlify site:

1. Navigate to the **Deployment** module
2. Click on the **Netlify** provider
3. Select the site you want to deploy
4. Click the **Deploy** button in the top right
5. Netlify will begin building and deploying your site

Each deployment is logged in Directus with its deployment metadata.

![Netlify integration overview](/img/netlify-integration-1.png)

## Monitoring Deployment Status

::callout{icon="material-symbols:info-outline"}
**Only deployments triggered from Directus appear here**. Deployments initiated directly in Netlify will not be displayed.
::

Track your deployments in the deployment list view. The list displays:

- **Deploy ID**: Netlify identifier for each build
- **Status**: Current deployment state
  - `BUILDING`: Build is in progress
  - `READY`: Site is successfully built, deployed, and live
  - `CANCELED`: Deployment was stopped before completion
  - `ERROR`: Build or deploy phase failed
- **Context**: Deployment environment (production, branch deploy, etc.)
- **Started**: When the build began
- **Duration**: Build time
- **Author**: Who initiated the deployment

## Viewing Build Logs

Access detailed build logs for any deployment:

1. Click any deployment from the site list
2. View the full build output, including:
   - Build steps and timing
   - Plugin execution details
   - Asset optimization and caching
   - Error messages (if applicable)
3. Use **search** to locate specific log entries
4. Filter by **log level** (All, Stdout, Stderr) to narrow results

Build logs are essential for diagnosing deployment issues and understanding your build pipeline.

![Netlify integration build logs](/img/netlify-integration-2.png)

## Exporting Logs

Download deployment logs for records or debugging:

1. Open the deployment details view
2. Click the **Download** icon in the top right
3. Logs are saved as a text file with timestamps

![Netlify integration export logs](/img/netlify-integration-3.png)

## Visiting Deployed Sites

Access your live deployments quickly:

1. From the deployment details view, click the **Visit** button
2. Your deployed site opens in a new tab

![Netlify integration visit site](/img/netlify-integration-4.png)

## Best Practices

**Deployment Workflow**
- Deploy after publishing content changes that affect your frontend
- Monitor initial deployments after setup to confirm builds succeed
- Retain build logs for failed deployments to aid troubleshooting

**Performance Tips**
- Build durations in the deployment list help track performance trends
- Netlify's build cache can accelerate subsequent builds

**Troubleshooting**
- For failed deployments, review build logs for error details
- Confirm your Netlify site configuration and build settings
- Verify your Personal Access Token has required permissions

## Next Steps

- **[← Back to Integration](/guides/integrations/netlify)** Return to the integration overview
