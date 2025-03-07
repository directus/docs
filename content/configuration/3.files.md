---
title: Files
description: Configuration for storage locations, metadata, upload limits, and transformations.
---


:partial{content="config-env-vars"}

By default, Directus stores all uploaded files locally on the file system or can also configure Directus to use external storage services. You can also configure _multiple_ storage adapters at the same time which allows you to choose where files are being uploaded on a file-by-file basis.

In the Data Studio, files will automatically be uploaded to the first configured storage location (in this case `local`). The used storage location is saved under `storage` in the `directus_files` collection.

## Storage Locations

| Variable            | Description                                                                                   | Default Value |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------- |
| `STORAGE_LOCATIONS` | A comma separated list of storage locations. You can use any names you'd like for these keys. | `local`       |

For each of the storage locations listed, you must provide the following configuration (variable name must be uppercase in these options):

| Variable                                   | Description                                                                          | Default Value |
| ------------------------------------------ | ------------------------------------------------------------------------------------ | ------------- |
| `STORAGE_<LOCATION>_DRIVER`                | Which driver to use, either `local`, `s3`, `gcs`, `azure`, `cloudinary`, `supabase`. |               |
| `STORAGE_<LOCATION>_ROOT`                  | Where to store the files on disk.                                                    | `''`          |
| `STORAGE_<LOCATION>_HEALTHCHECK_THRESHOLD` | Healthcheck timeout threshold in ms.                                                 | `750`         |

Based on your configured drivers, you must also provide additional variables, where `<LOCATION>` is the capitalized name of the item in the `STORAGE_LOCATIONS` value.

### Local (`local`)

| Variable                  | Description                       | Default Value |
| ------------------------- | --------------------------------- | ------------- |
| `STORAGE_<LOCATION>_ROOT` | Where to store the files on disk. |               |

### S3 (`s3`)

| Variable                                    | Description                | Default Value      |
| ------------------------------------------- | -------------------------- | ------------------ |
| `STORAGE_<LOCATION>_KEY`                    | User key.                  |                    |
| `STORAGE_<LOCATION>_SECRET`                 | User secret.               |                    |
| `STORAGE_<LOCATION>_BUCKET`                 | S3 bucket.                 |                    |
| `STORAGE_<LOCATION>_REGION`                 | S3 region.                 |                    |
| `STORAGE_<LOCATION>_ENDPOINT`<sup>[1]</sup> | S3 endpoint.               | `s3.amazonaws.com` |
| `STORAGE_<LOCATION>_ACL`                    | S3 ACL.                    |                    |
| `STORAGE_<LOCATION>_SERVER_SIDE_ENCRYPTION` | S3 server side encryption. |                    |
| `STORAGE_<LOCATION>_FORCE_PATH_STYLE`       | S3 force path style.       | false              |
| `STORAGE_<LOCATION>_CONNECTION_TIMEOUT`     | S3 connection timeout (ms).| 5000               |
| `STORAGE_<LOCATION>_SOCKET_TIMEOUT`         | S3 socket timeout (ms).    | 120000             |
| `STORAGE_<LOCATION>_MAX_SOCKETS`            | S3 max sockets.            | 500                |
| `STORAGE_<LOCATION>_KEEP_ALIVE`             | S3 keep alive.             | true               |

<sup>[1]</sup> When overriding this variable for S3, make sure to add your bucket's region in the endpoint: `s3.{region}.amazonaws.com`.

### Google Cloud Storage (`gcs`)

| Variable                          | Description                  | Default Value |
| --------------------------------- | ---------------------------- | ------------- |
| `STORAGE_<LOCATION>_KEY_FILENAME` | Path to key file on disk.    |               |
| `STORAGE_<LOCATION>_BUCKET`       | Google Cloud Storage bucket. |               |

### Azure (`azure`)

| Variable                            | Description                 | Default Value                                  |
| ----------------------------------- | --------------------------- | ---------------------------------------------- |
| `STORAGE_<LOCATION>_CONTAINER_NAME` | Azure Storage container.    |                                                |
| `STORAGE_<LOCATION>_ACCOUNT_NAME`   | Azure Storage account name. |                                                |
| `STORAGE_<LOCATION>_ACCOUNT_KEY`    | Azure Storage key.          |                                                |
| `STORAGE_<LOCATION>_ENDPOINT`       | Azure URL.                  | `https://{ACCOUNT_NAME}.blob.core.windows.net` |

### Cloudinary (`cloudinary`)

| Variable                         | Description                                                         | Default Value |
| -------------------------------- | ------------------------------------------------------------------- | ------------- |
| `STORAGE_<LOCATION>_CLOUD_NAME`  | Cloudinary cloud name.                                              |               |
| `STORAGE_<LOCATION>_API_KEY`     | Cloudinary API key.                                                 |               |
| `STORAGE_<LOCATION>_API_SECRET`  | Cloudinary API secret.                                              |               |
| `STORAGE_<LOCATION>_ACCESS_MODE` | Default access mode for the file. One of `public`, `authenticated`. |               |

Cloudinary is supported only as a storage driver. Changes made on Cloudinary are not synced back to Directus, and Directus won't rely on Cloudinary's asset transformations in the `/assets` endpoint.

### Supabase (`supabase`)

| Variable                          | Description                 | Default Value |
| --------------------------------- | --------------------------- | ------------- |
| `STORAGE_<LOCATION>_SERVICE_ROLE` | The admin service role JWT. |               |
| `STORAGE_<LOCATION>_BUCKET`       | Storage bucket.             |               |
| `STORAGE_<LOCATION>_PROJECT_ID`   | Project ID.                 |               |
| `STORAGE_<LOCATION>_ENDPOINT`     | Optional custom endpoint.   |               |

## Metadata

When uploading an image, Directus persists the `description`, `title`, and `tags` from available Exif metadata. For security purposes, collection of additional metadata must be configured:

| Variable                   | Description                                                                                           | Default Value                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `FILE_METADATA_ALLOW_LIST` | A comma-separated list of metadata keys to collect during file upload. Use `*` for all<sup>[1]</sup>. | ifd0.Make,ifd0.Model,exif.FNumber,exif.ExposureTime,exif.FocalLength,exif.ISOSpeedRatings |

<sup>[1]</sup>: Extracting all metadata might cause memory issues when the file has an unusually large set of metadata

## Upload Limits

| Variable                     | Description                                                                       | Default Value |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------- |
| `FILES_MAX_UPLOAD_SIZE`      | Maximum file upload size allowed. For example `10mb`, `1gb`, `10kb`.              |               |
| `FILES_MIME_TYPE_ALLOW_LIST` | Allow list of mime types that are allowed to be uploaded. Supports `glob` syntax. | `*/*`         |

## Chunked Uploads

Large files can be uploaded in chunks to improve reliability and efficiency, especially in scenarios with network instability or limited bandwidth. This is implemented using the [TUS protocol](https://tus.io/).

| Variable                | Description                                                        | Default Value |
| ----------------------- | ------------------------------------------------------------------ | ------------- |
| `TUS_ENABLED`           | Whether or not to enable the chunked uploads.                      | `false`       |
| `TUS_CHUNK_SIZE`        | The size of each file chunks. For example `10mb`, `1gb`, `10kb`.   | `10mb`        |
| `TUS_UPLOAD_EXPIRATION` | The expiry duration for uncompleted files with no upload activity. | `10m`         |
| `TUS_CLEANUP_SCHEDULE`  | Cron schedule to clean up the expired uncompleted uploads.         | `0 * * * *`   |

::callout{icon="material-symbols:warning-rounded" color="amber"}

**Chunked Upload Restrictions**<br/>

Some storage drivers have specific chunk size restrictions. The `TUS_CHUNK_SIZE` must meet the relevant restrictions for
the storage driver(s) being used.

| Storage Driver              | `TUS_CHUNK_SIZE` Restriction                                                     |
| --------------------------- | -------------------------------------------------------------------------------- |
| `storage-driver-gcs`        | Must be a power of 2 with a minimum of `256kb` (e.g. `256kb`, `512kb`, `1024kb`) |
| `storage-driver-azure`      | Must not be larger than `100mb`                                                  |
| `storage-driver-cloudinary` | Must not be smaller than `5mb`                                                   |

::

## Assets

| Variable                                 | Description                                                                                                                          | Default Value |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `ASSETS_CACHE_TTL`                       | How long assets will be cached for in the browser. Sets the `max-age` value of the `Cache-Control` header.                           | `30d`         |
| `ASSETS_TRANSFORM_MAX_CONCURRENT`        | How many file transformations can be done simultaneously.                                                                            | `25`          |
| `ASSETS_TRANSFORM_IMAGE_MAX_DIMENSION`   | The max pixel dimensions size (width/height) that is allowed to be transformed.                                                      | `6000`        |
| `ASSETS_TRANSFORM_TIMEOUT`               | Max time spent trying to transform an asset.                                                                                         | `7500ms`      |
| `ASSETS_TRANSFORM_MAX_OPERATIONS`        | The max number of transform operations that is allowed to be processed (excludes saved presets).                                     | `5`           |
| `ASSETS_INVALID_IMAGE_SENSITIVITY_LEVEL` | Level of sensitivity to invalid images. See the [`sharp.failOn`](https://sharp.pixelplumbing.com/api-constructor#parameters) option. | `warning`     |

Image transformations can be heavy on memory usage. If you're using a system with 1GB or less available memory, we recommend lowering the allowed concurrent transformations to prevent you from overflowing your server.
