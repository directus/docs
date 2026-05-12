---
id: connect-supabase-postgres-to-directus
title: Connect Supabase Postgres to Directus
description: Configure a self-hosted Directus instance to use Supabase Postgres over a direct connection with SSL and verify the setup.
technologies:
  - supabase
---

**[← Back to Supabase Integration](/guides/integrations/supabase)**

You run self-hosted Directus against a Supabase PostgreSQL database. You need one Supabase project for Postgres, a host where you run Docker Compose (or another runtime), and environment variables that match Supabase's connection details.

You often pair a Supabase-backed application with Directus for an admin surface and marketing CMS.

## Before You Start

This guide sets up two separate things that work together:

- **Supabase** hosts your PostgreSQL database in the cloud. It does not run Directus — it only provides the database that Directus connects to.
- **Directus** runs on a separate host using Docker Compose. This can be your local machine for development, or a server or cloud platform (such as Railway, Render, or a VPS) for production. See [Self-hosting: Deploying](/self-hosting/deploying) for options.

You will need:

- A [Supabase](https://supabase.com) project with PostgreSQL available
- A machine or host where you can run [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Network access from that host to Supabase Postgres on port **5432** (direct connection, not transaction pooler mode)

## Get the direct connection string from Supabase

Supabase exposes more than one connection mode. Use the **direct** database connection on port **5432** for Directus. Use transaction pooler mode on port **6543** only after you confirm your driver and workload behave correctly with pooling.

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Click the green **Connect** button in the top navigation bar.
3. In the "Connect to your project" modal, click the **Direct** tab.

![The Supabase Connect modal showing the Direct tab selected, with connection string details visible.](/img/supabase-dashboard-connection.png)

## Configure Directus with Docker Compose

Enter your connection details from the **Direct** tab into the fields below to generate a ready-to-use `docker-compose.yml`.

:supabase-configurator

Set `PUBLIC_URL` to the URL clients use to reach Directus. Add other required variables for your environment (see [General](/configuration/general) and [Self-hosting: Deploying](/self-hosting/deploying)).

## SSL settings

The generated file includes `DB_SSL: "true"` and `DB_SSL__REJECT_UNAUTHORIZED: "true"`. Supabase recommends SSL for all Postgres connections and production projects often enforce it.

- **`DB_SSL`** — set to `true` so the client connects over TLS.
- **`DB_SSL__REJECT_UNAUTHORIZED`** — controls certificate verification. Leave this `true` when the server certificate chains to a public CA that Node.js trusts (which is the case for Supabase). Set it to `false` only if you need to accept a weaker trust model (for example, corporate TLS inspection) — prefer **`DB_SSL__CA`** or **`DB_SSL__CA_FILE`** to supply the correct CA instead. See [Database](/configuration/database) and [Environment variables](/configuration/intro#type-casting-and-nesting).

If the connection fails with TLS or certificate errors, confirm your host can reach Supabase on the direct port, then check Supabase's SSL documentation for your project.

::callout{icon="material-symbols:info-outline"}
If your runtime is IPv4-only, Supabase direct connections can fail because direct mode is IPv6 by default. Use Supabase session pooler mode (also port `5432`) as the fallback and keep SSL enabled.
::

::callout{icon="material-symbols:warning" color="warning"}
**Row Level Security (RLS)**

Directus connects to PostgreSQL with **one** database user and issues queries with that user's privileges. Supabase **RLS policies do not apply** to data accessed through Directus in the same way they do for the Supabase client scoped to an end-user JWT.

Do not rely on RLS to enforce access control for content edited in Directus. Configure [Directus permissions and roles](/guides/auth/access-control) and API tokens instead.
::

## Verify the connection

1. Start the stack: `docker compose up` (or your orchestrator equivalent)
2. Watch logs for successful startup and database migration messages
3. Open Directus at `PUBLIC_URL`, complete onboarding if prompted, and sign in
4. In the Data Studio, confirm collections load and create a test item in a non-system collection when you have one

If Directus cannot connect, recheck host, port (**direct** vs pooler), password, firewall egress to `5432`, and SSL settings.

## Optional: Directus Labs starters

When you start from a **[Directus starter template](https://github.com/directus-labs/starters)** instead of a blank `docker-compose.yml`, keep the starter frontend and tooling as that repository documents. Replace only the **Directus database** environment so `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, and SSL variables match your Supabase project (same values as earlier in this guide). Set the starter **Directus base URL** variables to your running instance. Add [Supabase Storage](/guides/integrations/supabase/use-supabase-storage-with-directus) variables only when you want uploads in Supabase.

## Next Steps

- [Use Supabase Storage with Directus](/guides/integrations/supabase/use-supabase-storage-with-directus)
- [Database configuration reference](/configuration/database)
- [Self-hosting: Deploying](/self-hosting/deploying)
