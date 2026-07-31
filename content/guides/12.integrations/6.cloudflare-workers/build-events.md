---
id: cloudflare-workers-build-events
title: Build events (queue)
description: Optional Cloudflare Queues and Workers Builds event subscriptions so Directus can create and update deployment runs when builds run outside the app.
technologies:
  - cloudflare
---

::callout{icon="material-symbols:info-outline" color="info"}
**Optional setup**
<br>
The Cloudflare Workers deployment provider works without a queue. Trigger builds from Directus and view run status and logs in the app. Add a **queue** when you want runs to update **automatically** for builds started elsewhere (for example git push or CI), similar to webhook-based providers, without hosting your own proxy.
::

## Before You Start

- Complete the **[Cloudflare Workers](/guides/integrations/cloudflare-workers)** provider setup (token, Account ID, Worker selection).
- In Cloudflare, enable **Workers Builds** and connect Git for each Worker you will subscribe to.

**[← Back to Cloudflare Workers Integration](/guides/integrations/cloudflare-workers)**

**[Working with Deployments →](/guides/integrations/cloudflare-workers/deployments)**

## What you are configuring

1. A **Cloudflare Queue** that receives Workers Builds events (started, succeeded, failed, canceled).
2. **HTTP pull** enabled on that queue so the Directus API can pull and acknowledge messages from Cloudflare's queue API.
3. An **event subscription** per Worker you care about, all writing to the **same** queue. Directus stores **one queue ID**; each message identifies the Worker so Directus can route it to the right project.
4. In Directus, the **Event Subscription Queue ID** field on the **Cloudflare Workers** provider, plus an API token that can use **Queues** (see below).

## In Cloudflare

1. **Create a queue** (Workers & Pages → **Queues**).
   - Open **Cloudflare Dashboard** → your account → **Workers & Pages** → **Queues**.
   - Click **Create queue**.
   - Give it a clear name (for example `directus-build-events`).
   - Open the queue details and copy the queue **ID**. Paste this exact ID into Directus later.

   You can also create queues with Wrangler (`queues create`) if your team uses CLI-first workflows.

2. **Enable HTTP pull** on that queue:
   - In the queue details, open **Consumers**.
   - Add an **HTTP pull consumer**.
   - Confirm the queue now shows an HTTP pull consumer as active.

   Wrangler example:

   ```bash
   npx wrangler queues consumer http add <queue-name>
   ```

   If the queue already has a **push** consumer, Cloudflare may require you to remove it before HTTP pull works.

3. **Create an event subscription** for each Worker Directus should track:
   - In the same queue, open **Subscriptions** and click **Add subscription**.
   - Source: **Workers Builds** / worker (labels in the dashboard may vary).
   - **Worker**: the script that uses Workers Builds (the same one you deploy from Directus or CI).
   - **Events**: include at least **started**, **succeeded**, **failed**, and **canceled** (or the subset you need).
   - Save the subscription and confirm it appears in the queue's subscriptions list.

   Use the dashboard **Subscriptions** UI on the queue, or Wrangler (`queues subscription create`) if the UI is unreliable.

**Multiple Workers:** add one subscription per Worker, each targeting the **same** queue. In Directus you still paste that queue's ID only once.

## In Directus

1. Open **Settings** → **Deployments** (or your product's deployment settings) and edit the **Cloudflare Workers** provider.
2. Paste the queue **ID** into **Event Subscription Queue ID** and save.
3. Keep every Worker you want events for **selected** in the provider's project list. Directus matches Cloudflare's worker name on each message to those projects.

**API token:** the token used for this provider needs **Account → Queues → Edit** (read and write) in addition to your existing Workers Builds and Scripts permissions. A single combined token is the usual approach.

**Polling:** Directus pulls the queue on a timer (about **once per minute** by default). Host administrators can override the schedule with the environment variable `DEPLOYMENT_CLOUDFLARE_QUEUE_POLL_SCHEDULE` using the same cron style as other Directus scheduled jobs.


## Next Steps

- **[Working with Deployments](/guides/integrations/cloudflare-workers/deployments)**: trigger builds, status, and logs
- **[← Back to Cloudflare Workers Integration](/guides/integrations/cloudflare-workers)**
