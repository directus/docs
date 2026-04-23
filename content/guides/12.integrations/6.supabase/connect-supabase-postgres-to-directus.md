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

You will need:

- A [Supabase](https://supabase.com) project with PostgreSQL available
- A machine or host where you can run [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Network access from that host to Supabase Postgres on port **5432** (direct connection, not transaction pooler mode)

## Get the direct connection string from Supabase

Supabase exposes more than one connection mode. Use the **direct** database connection on port **5432** for Directus. Use transaction pooler mode on port **6543** only after you confirm your driver and workload behave correctly with pooling.

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project
2. Go to **Project Settings** and open the **Database** section
3. Find the **Connection string** or connection parameters for **Direct connection** / **URI**
4. Copy the values you map into Directus:

   - **Host** (for example `db.<project-ref>.supabase.co`)
   - **Port** (default `5432` for direct)
   - **Database name** (often `postgres`)
   - **User** (often `postgres` or the database user Supabase shows)
   - **Password** (the database user password)

Keep the password secret. Use [Docker secrets](https://docs.docker.com/engine/swarm/secrets/) or your host secret manager in production.

## Configure Directus with Docker Compose

Create a `docker-compose.yml` that runs the official Directus image and passes database settings through the environment.

Map Supabase values to these variables:

| Variable | Purpose |
| --- | --- |
| `DB_CLIENT` | Set to `pg` for PostgreSQL |
| `DB_HOST` | Supabase database host |
| `DB_PORT` | `5432` for direct connection |
| `DB_DATABASE` | Database name from Supabase |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |

Example:

```yaml
services:
  directus:
    image: directus/directus:11.17.0
    ports:
      - 8055:8055
    environment:
      SECRET: "replace-with-a-random-string"
      PUBLIC_URL: "http://localhost:8055"
      DB_CLIENT: "pg"
      DB_HOST: "db.your-project-ref.supabase.co"
      DB_PORT: "5432"
      DB_DATABASE: "postgres"
      DB_USER: "postgres"
      DB_PASSWORD: "your-database-password"
```

Set `PUBLIC_URL` to the URL clients use to reach Directus. Add other required variables for your environment (see [General](/configuration/general) and [Self-hosting: Deploying](/self-hosting/deploying)).

## Configure SSL

Supabase recommends SSL for Postgres connections; production projects often enforce it. Turn on SSL for the Directus database connection and adjust verification if your environment requires it.

- Set **`DB_SSL`** to `true` so the client connects over TLS.
- Use **`DB_SSL__REJECT_UNAUTHORIZED`** to control certificate verification:
  - Leave verification **on** when the server certificate chains to a public CA that Node.js trusts.
  - Set `DB_SSL__REJECT_UNAUTHORIZED` to `false` only when you accept the weaker trust model (for example corporate TLS inspection). Prefer **`DB_SSL__CA`** or **`DB_SSL__CA_FILE`** when you can supply the right CA instead. See [Database](/configuration/database) and [Environment variables](/configuration/intro#type-casting-and-nesting).

Example additions to `environment`:

```yaml
      DB_SSL: "true"
      # Optional; include only if you need to override verification behavior
      DB_SSL__REJECT_UNAUTHORIZED: "true"
```

If the connection fails with TLS or certificate errors, confirm your host can reach Supabase on the direct port, then read Supabase's SSL documentation for your project.

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
