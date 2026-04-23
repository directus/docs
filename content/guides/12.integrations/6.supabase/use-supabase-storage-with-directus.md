---
id: use-supabase-storage-with-directus
title: Use Supabase Storage with Directus
description: Configure Directus to store files in Supabase Storage using the S3-compatible API and the Directus S3 storage driver.
technologies:
  - supabase
---

**[← Back to Supabase Integration](/guides/integrations/supabase)**

[Supabase Storage](https://supabase.com/storage) is object storage with an S3-compatible API. You use it with Directus when you need uploads and asset handling in Directus while objects live in your Supabase project.

Directus exposes two ways to target Supabase Storage (see [Files](/configuration/files)):

- **`supabase` driver:** Configure with your project **service role** JWT, **project ID**, and **bucket**. It uses Directus's Supabase storage integration. Choose it when you already have a service role secret and you do not want to create **S3 access keys**.
- **`s3` driver:** Configure with **S3 access keys**, **region**, and **endpoint** (path such as `/storage/v1/s3`), the same pattern as other S3-compatible hosts. Choose it when you follow Supabase's [S3 authentication](https://supabase.com/docs/guides/storage/s3/authentication) flow or you rely on tools that expect AWS-style credentials.

This guide uses the **`s3`** driver because it follows Supabase's documented S3 protocol setup (keys, endpoint, path style) and matches how you configure other S3-compatible storage in Directus.

## Before You Start

You will need:

- A Supabase project with [Storage](https://supabase.com/docs/guides/storage) enabled
- S3 protocol access enabled and **S3 access keys** generated in Supabase (server-side only; these keys have broad S3 access across your project buckets and bypass Storage RLS)
- A self-hosted Directus instance where you can set environment variables

## Why use Supabase Storage with Directus

- **Centralized files:** Marketing assets and uploads sit next to your Supabase data
- **S3-compatible tooling:** You reuse the same endpoint and signing model as other S3 clients
- **Directus behavior:** The Data Studio, permissions, and transforms still apply to file metadata and delivery

## Get Storage credentials from Supabase

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project
2. Go to **Project Settings** and open **Storage**
3. Enable **S3 connection** if it is not already enabled
4. Create or view **S3 access keys** and note:
   - **Access key ID** and **Secret access key** (store the secret securely; Supabase may show it only once)
   - **Endpoint** and **region** from the same settings page

Supabase documents the S3 endpoint in this form (replace `project_ref` and use your project region):

`https://<project_ref>.storage.supabase.co/storage/v1/s3`

For large uploads, prefer the **`storage.supabase.co`** hostname as shown in the [S3 authentication](https://supabase.com/docs/guides/storage/s3/authentication) documentation instead of the generic project API URL.

## Create and configure a bucket

1. In the Supabase Dashboard, open **Storage**
2. Create a bucket for Directus (for example `directus-assets`)
3. For assets that must be **publicly readable** by URL (typical for public site images), set the bucket to **public** in Supabase's bucket settings

Directus writes objects into this bucket. Use different buckets for production and staging when you need isolation.

## Configure Directus environment variables

Pick a storage location key (any label). Write it in **uppercase** in environment variable names. This example uses `SUPABASE`.

Set:

| Variable | Value |
| --- | --- |
| `STORAGE_LOCATIONS` | `SUPABASE` (or `local,SUPABASE` if you keep local storage too) |
| `STORAGE_SUPABASE_DRIVER` | `s3` |
| `STORAGE_SUPABASE_KEY` | S3 access key ID |
| `STORAGE_SUPABASE_SECRET` | S3 secret access key |
| `STORAGE_SUPABASE_BUCKET` | Your bucket name |
| `STORAGE_SUPABASE_REGION` | Region from Supabase Storage settings |
| `STORAGE_SUPABASE_ENDPOINT` | S3 endpoint URL (see above) |
| `STORAGE_SUPABASE_FORCE_PATH_STYLE` | `true` |

Supabase's S3 API expects path-style addressing. Set **`STORAGE_SUPABASE_FORCE_PATH_STYLE`** to **`true`**, matching the [Supabase S3 docs](https://supabase.com/docs/guides/storage/s3/authentication).

Example fragment:

```yaml
      STORAGE_LOCATIONS: "SUPABASE"
      STORAGE_SUPABASE_DRIVER: "s3"
      STORAGE_SUPABASE_KEY: "your-access-key-id"
      STORAGE_SUPABASE_SECRET: "your-secret-access-key"
      STORAGE_SUPABASE_BUCKET: "directus-assets"
      STORAGE_SUPABASE_REGION: "us-east-1"
      STORAGE_SUPABASE_ENDPOINT: "https://your-project-ref.storage.supabase.co/storage/v1/s3"
      STORAGE_SUPABASE_FORCE_PATH_STYLE: "true"
```

Optional S3 tuning (timeouts, encryption, ACLs) is listed in [Files](/configuration/files#s3-s3).

::callout{icon="material-symbols:info-outline"}
**Default upload location**

The first entry in `STORAGE_LOCATIONS` is the default for new uploads in the Data Studio unless a field sets `storage` explicitly. See [File uploads](/guides/files/upload).
::

## Verify uploads

1. Restart Directus after you change storage environment variables
2. Open **File Library** and upload a test image
3. In the Supabase Dashboard, open **Storage**, select your bucket, and confirm the object exists
4. Load the asset through your Directus project URL or frontend and confirm public access matches your bucket policy

If uploads fail, verify the endpoint (including `/storage/v1/s3`), region, keys, `FORCE_PATH_STYLE`, and bucket name. See [Files](/configuration/files) for health checks and driver limits.

## Next Steps

- [Files configuration](/configuration/files)
- [Connect Supabase Postgres to Directus](/guides/integrations/supabase/connect-supabase-postgres-to-directus)
- [Supabase Storage documentation](https://supabase.com/docs/guides/storage)
