---
id: 2cdec3d5-9f3d-4c43-9541-6a9f5bc68007
slug: deploy-directus-to-google-cloud-platform
title: Deploy Directus to Google Cloud Platform
authors:
  - name: Trust Jamin
    title: Guest Author
description: Learn how to deploy Directus on GCP with a Cloud SQL database and Cloud Storage Bucket.
---
In this tutorial, you will learn how to deploy a self-hosted instance of Directus to Google Cloud Platform (GCP) Cloud Run and connect it with a Cloud SQL database (PostgreSQL) and Cloud Storage for storing assets.

## Before You Start

You will need:

- A [Google Cloud Account](https://cloud.google.com) with billing enabled.
- Google Cloud SDK [(gcloud CLI)](https://cloud.google.com/sdk/docs/install) installed in your local computer.
- [Docker](https://docker.com/) locally installed and running on your computer.

## Create a Google Cloud Project

Log in to Google Cloud Platform and head to the [project page](https://console.cloud.google.com/projectcreate) to create a new project, name this project `directus-project`, and associate it with your organization.

## Set Up a Cloud SQL Database

Go to your Google Cloud console -> Menu -> SQL. On the Cloud SQL page, click on `Create Instance`, choosing PostgreSQL to create a Cloud SQL instance. You may need to enable this API if it's not already enabled.

Add an instance ID and a password for the default admin user `postgres` and select the database version you need. Choose also the Cloud SQL edition and region to suit your needs.

Click on the `Create Instance` button to create your new instance.

![Screenshot of a Cloud SQL creation page](/img/5527868d-e61c-474a-a8f9-27afc5dfd13c.webp)

After successful creation, you will be redirected to the instance page; here, you'll find details about the PostgreSQL database instance created, such as the connection name and other information.

Copy the connection name for later usage.

![A PostgreSQL database instance details page. Highlighted is the connection name under the Connect to this instance header](/img/726fa639-23e2-4ea8-a699-689c27554336.webp)

## Set Up the Docker Container

::callout{icon="material-symbols:info-outline"}

In this section, we will specify the version of Directus as `10.10.4` as the latest at the time of writing. Please refer to the [releases](https://github.com/directus/directus/releases) and replace this with the latest version.

::

To deploy a Docker container to Cloud Run, you must first prepare the container. On your local computer, create a `Dockerfile` with the following content, which creates a new Docker image using the Directus image as the base image:

```yml
FROM directus/directus:10.10.4
```

Next, Build the docker image and tag it to be `directus:10.10.4`:

```bash
docker build -t directus:10.10.4 --platform linux/amd64 .
```

::callout{icon="material-symbols:info-outline"}

### Using an Apple Silicon Machine?

```bash
docker buildx build -t directus:10.10.4 --platform linux/amd64 .
```

::

## Set up Repository on Google Cloud

To deploy the `Dockerfile` created, you must set up a repository on the Google Cloud Platform.
In the Google Cloud console, search for `repositories` and click on the Artifact Registry repositories. (You may need to enable Artifact Registry API if it is not already enabled).

Click on the `Create repository` button and create a new repository with the name `directus-repo` with the following details:

- Format: Docker
- Mode: Standard
- Location type: Region (You can select multiple regions depending on your need)
- Region: `us-central1` (Again, choose your preferred region)
- Encryption: Google-managed encryption key
- Cleanup policies: Delete artifacts.

Click on **Create** to create a new repository.

### Pushing the Dockerfile to Google Cloud

To push the `Dockerfile` to the created repository, you must first be authenticated via the CLI that ships Google Cloud SDK.

::callout{icon="material-symbols:info-outline"}

In this section, we will specify `us-central1` as the region. If you used a different region, please replace it.

::

Open your terminal, log in to Google Cloud, and select the project you previously created:

```bash
gcloud auth login
gcloud config set project PROJECT_ID
```

In the directory where the `Dockerfile` is located, configure Docker to authenticate with the Google Artifact Registry:

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```


Tag the local docker image you built with the repository:

```bash
docker tag directus:10.10.4 us-central1-docker.pkg.dev/directus-project/directus-repo/directus:10.10.4
```

Replace `directus-project` is the project ID you are working on, `directus-repo` with the repository you created, and the region if required.

Finally, push the Docker image to the Artifact Registry:

```bash
docker push  us-central1-docker.pkg.dev/directus-project/directus-repo/directus:10.10.4
```

## Set up Cloud Run

Google Cloud Run lets you run Docker containers directly on top of Google's Cloud platform.

In the Google Cloud console, go to Menu -> Cloud Run (You need to enable this API) -> Create Service, and then create a new service with the following options:

- **Deploy one revision from an existing container image**
- **Container Image URL**: To select a container image URL, click the select button to open the Artifact Registry and select the image you pushed earlier.
- Add your preferred service name, e.g., `directuscloud`, and select a region, e.g., `us-central1`
- **Authentication**: Check on `Allow unauthenticated invocations`
- **CPU allocation**: check that CPU is only allocated during request processing
- **Revision autoscaling**: Choose the number of instances you need.

Toggle the Container(s), Volumes, Networking, Security dropdown to show more details about the container. On the settings tab, select a resource of 2GiB memory and 2 CPU (This is the recommended minimum configuration for setting up a Directus instance)

On the variables & secret tab, add the required environment variables needed to start a Directus instance:

```yml
KEY: YOUR_RANDOM_KEY
SECRET: YOUR_RANDOM_SECRET
ADMIN_EMAIL: admin@example.com
ADMIN_PASSWORD: d1r3ctu5
DB_CLIENT: pg
DB_HOST: /cloudsql/directus-project:us-central1:directus-db
DB_PORT: 5432
DB_DATABASE: postgres
DB_USER: postgres
DB_PASSWORD: YOUR_DB_PASSWORD
DB_SSL__REJECT_UNAUTHORIZED: false
DB_SSL: false
PRESSURE_LIMITER_ENABLED: false
```

`DB_HOST` is a combination of `/cloudsql/` and the connection name of your Cloud SQL database. This is a prefix indicating that the hostname is for a Cloud SQL instance.

To connect Cloud SQL to Cloud Run, click on the Cloud SQL instance select box to select your previously created Cloud SQL database instance.

Click on the create button to create your new Cloud Run service; when successfully deployed, click on the service name to show more details about the service; on the dashboard, you'll find the URL where Directus is running.

![Google Cloud Run dashboard page](/img/d381e4fb-077f-40fe-9163-3c502bef7caa.webp)

## Connect Cloud Storage (Optional)

If you want to use Google Cloud Storage as a bucket for storing your files and assets, go to the console -> Main Menu -> Cloud Storage

Click on Create a new Bucket and select a bucket name, region, and default storage class as standard, Access control as uniform, and create a new bucket.

Copy the bucket name to add to your container environment variables and update the environment variables in Cloud Run the details:

```yml
STORAGE_LOCATIONS: gcs
STORAGE_GCS_DRIVER: gcs
STORAGE_GCS_BUCKET: YOUR_CLOUD_STORAGE_BUCKET_NAME
STORAGE_GCS_CREDENTIALS: YOUR_SERVICE_ACCOUNT_KEY_JSON
STORAGE_GCS_ROOT: cms/assets
```

`YOUR_SERVICE_ACCOUNT_KEY_JSON` can be generated in the Google Cloud console -> IAM & Admin -> Services Accounts -> Click on your project's Compute Engine default service account email and click on the Keys tab to create a new key.

## Next Steps

Some steps you could consider moving forward toward improving your deployment include implementing improved security permissions for connecting to the created resources or using [Google Secret Manager](https://cloud.google.com/security/products/secret-manager) for managing your `ENV` variables.

This setup is a good start, but you may need to consider setting up backups, round-the-clock monitoring, upgrading Directus, and the inability to restart automatically in the event of a crash. Each of these can be configured and maintained separately.
