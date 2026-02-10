---
id: vercel-deployments
title: Deployments
description: Complete guide for triggering deployments, monitoring build status, and viewing logs for your Vercel projects from Directus.
technologies:
  - vercel
---

Once you've connected your Vercel account and configured your projects, you can manage all deployment activities directly from Directus. 

You should trigger deployments after publishing content changes that affect your frontend.

**[← Back to Vercel Integration](/guides/integrations/vercel)**

## Triggering Deployments

Trigger new deployments for any connected Vercel project:

1. Navigate to the **Deployment** module
2. Click on the **Vercel** provider
3. Select the project you want to deploy
4. Click the **Deploy** button in the top right
5. Vercel will begin building and deploying your project

Each deployment is tracked in Directus with the associated deployment metadata.

![Vercel integration overview](/img/vercel-integration-1.png)

## Monitoring Deployment Status

::callout{icon="material-symbols:info-outline"}
**Only deployments triggered from Directus appear in this interface**. Deployments made directly in Vercel will not be shown.
::

Track the status of your deployments in the deployment list screen. The list shows:

- **Deployment ID**: Vercel identifier for each build
- **Status**: Current deployment state
  - `BUILDING`: The deployment is currently being built
  - `READY`: The project is successfully built, deployed, and live
  - `CANCELED`: The deployment was canceled before completion
  - `ERROR`: The deployment failed during the build or runtime phase
- **Target**: Environment (production, preview, etc.)
- **Started**: When the deployment began
- **Duration**: How long the build took
- **Author**: Who triggered the deployment

## Viewing Build Logs

Access detailed build logs for any deployment:

1. Click on any deployment from the project list
2. View the complete build output, including:
   - Build steps and timing
   - Static/SSG/dynamic rendering information
   - Build cache creation and upload
   - Error messages (if applicable)
3. Use the **search** function to find specific log entries
4. Filter by **log level** (All, Stdout, Stderr) to narrow results

Build logs help you troubleshoot deployment issues and understand your build process.

![Vercel integration build logs](/img/vercel-integration-2.png)

## Exporting Logs

Download deployment logs for documentation or troubleshooting:

1. Open the deployment details view
2. Click the **Download** icon in the top right
3. Logs are exported as a text file with associated timestamps

![Vercel integration export logs](/img/vercel-integration-3.png)


## Visiting Deployed Sites

Quickly access your live deployments:

1. From the deployment details view, click the **Visit** button
2. Your deployed site opens in a new tab

![Vercel integration export logs](/img/vercel-integration-4.png)

## Best Practices

**Deployment Workflow**
- Trigger deployments after publishing content changes that affect your frontend
- Monitor the first few deployments after setup to ensure builds complete successfully
- Keep build logs for failed deployments to troubleshoot issues

**Performance Tips**
- Build times shown in the deployment list help you track build performance over time
- Vercel's build cache can help improve subsequent deployment speeds

**Troubleshooting**
- If a deployment fails, check the build logs for specific error messages
- Verify your Vercel project configuration and build settings
- Ensure your Personal Access Token has the necessary permissions

## Next Steps

- **[← Back to Integration](/guides/integrations/vercel)** Return to the integration overview
