---
id: 9b45c97a-d980-42fd-b802-9b341f10b35a
slug: deploy-directus-to-azure-web-apps
title: Deploy Directus to Azure Web Apps
technologies:
  - azure
authors:
  - name: Durojaye Olusegun
    title: Guest Author
  - name: Paul Boudewijn
    title: Guest Author
description: Learn how to deploy Directus on a Docker container on Azure.
---
This guide outlines the steps to deploy Directus on Azure using Docker, with a focus on utilizing PostgreSQL as a database.

## Before You Start

Before deploying Directus on Azure, make sure you have the following prerequisites:

- An existing or [new Azure account](https://go.microsoft.com).
- A basic understanding of Docker.

## Create and Set Up a Resource Group

To begin the deployment process, you need to set up a resource group in Azure. A resource group acts as a logical container to group and manage related Azure resources. It allows you to organize your resources, control access permissions, and manage them collectively.

Sign into your Azure account via the [Azure Portal](https://portal.azure.com/). Head to Resource groups and click the **Create** button.

Provide a unique name for your resource group and choose the Azure subscription to link your new group to. Select the appropriate region for your resource group, considering factors like data residency and proximity to users, and adjust other settings if required.

## Setting Up Azure Database for PostgresSQL

Directus connects to an existing database, so it's time to create one. Enter your new resource group and, in the Overview pane, click the **Create** button to initiate the resource creation process.

In the Azure Marketplace pane, search for and select a Azure Database for PostgreSQL resource. Secure your new database with PostgreSQL authentication, a strong password, and consider firewall rules for additional protection.

![Credentials for Azure PostgreSQL.](/img/462fae47-6e45-4d5f-8a59-b70003b566b6.webp)

Save the server's name, username, and password for later use when configuring Directus.

Finally, click on **Review + Create** and then **Create** to create your new PostgreSQL Database deployment.

## Deploying Directus on a Web App Service

Within the Azure Marketplace, select the Web App resource. When creating a Web App, you will step through multiple configuration pages.

### Basics

- **Subscription/Resource Group:** select the same resource group we created and used earlier.
- **Publish:** Container
- **Operation System:** Linux

### Container

- **Image source:** Other container registries
- **Access Type:** Public
- **Registry server URL:** https://index.docker.io
- **Image and tag:** directus/directus:11.13.2
- **Port:** 8055


::callout{icon="material-symbols:info-outline"}

In this section, we will specify the version of Directus as `11.13.2` as the latest at the time of writing. Please refer to the [releases](https://github.com/directus/directus/releases) and replace this with the latest version.

::

Finally, click on **Review + Create** and then **Create** to create your new Web App.

### Environment variables

Once the web app has been created, we will return to it to enter the required environment variables. Go to Settings -> Environment variables and add the following variables:

| Name | Value | 
|------|-------| 
| `SECRET` | <REPLACE_WITH_RANDOM_VALUE> |
| `ADMIN_EMAIL` | admin@example.com |
| `ADMIN_PASSWORD` | d1r3ctu5 |
| `DB_CLIENT` | pg |
| `DB_HOST` | <YOUR_PDS_DB_URL> |
| `DB_PORT` | 5432 |
| `DB_DATABASE` | postgres |
| `DB_USER` | <YOUR_DB_USER> |
| `DB_PASSWORD` | <YOUR_DB_PASSWORD> |

Let’s go through some of the key parameters in this configuration above:

- Set the `DB_HOST` value to the your Azure Database for PostgreSQL's server name. You can find it in the resource's overview section.
- Also set `DB_USER and DB_PASSWORD` to the credentials you set up during the creation of your Azure Database for PostgreSQL.


::callout{icon="material-symbols:info-outline"}

The `WEBSITES_ENABLE_APP_SERVICE_STORAGE` setting must remain at its default value of "off". Changing it to "on" will prevent Directus from starting.

::

### Mounting volumes

To enable persistence for Directus, you must use external persistent storage for your file uploads, as Docker containers are ephemeral by default. 

First we need to create a storage account. In the Azure Marketplace pane, search for and select Storage accounts. Click the **Create** button and create a new storage account with preferred storage type "Azure Files". Click on **Review + Create** and then **Create** to create your new storage account.
Return to the storage account we  created and go to Data storage -> File shares. Add the following file shares:

| Name | Access tier |
| ---- | ----------- |
| database | Hot |
| extensions | Hot |
| uploads | Hot |

Then return to the Web App and head to Settings -> Configuration -> Path mappings. Add the following mappings:

| Name | Storage type | Protocol | Storage container | Mount path |
| ---- | ------------ | -------- | ----------------- | ---------- |
| Database | Azure Files | SMB | database | /directus/database |
| Extensions | Azure Files | SMB | extensions | /directus/extensions |
| Uploads | Azure Files | SMB | uploads | /directus/uploads |

::callout{icon="material-symbols:info-outline"}

Although Azure Web Apps provide an option to configure volume mounts in the container's configuration screen, this does not work with Directus.
To use the built-in App Service storage, the environment variable `WEBSITES_ENABLE_APP_SERVICE_STORAGE` must be set to true.
When this setting is enabled, Azure automatically mounts an Azure Files share over the container’s `/home` directory. Unfortunately, this mount hides critical files and directories that Directus expects to be present in `/home`, causing the application to fail during startup.

::

Following the creation of the Web App Resource, Directus is now successfully deployed and can be visited via the default domain in the Azure Web App page.

## Troubleshooting Tips

Here are few troubleshooting tips:

### Connection Issues with Azure Database for PostgreSQL

If you encounter connectivity problems between Directus and your Azure Database for PostgreSQL, consider the following steps:

- **Firewall Rules:** Ensure that the firewall rules for your Azure Database allow connections from the Azure Web App. You can configure this in the Azure Portal under the *Connection Security* section for your PostgreSQL server.
- **Connection String:** Double-check the values of the environment variables for `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and other related parameters. Any discrepancies here can result in connection failures.

### Azure Web App Deployment Failures

In case your Azure Web App deployment fails, consider the following:

- **Docker Image Compatibility:** Ensure that the Directus Docker image version specified is compatible with the Azure Web App environment. Check for updates or use a different version if needed.
- **Resource Group Permissions:** Confirm that the Azure account used for deployment has the necessary permissions to create and manage resources within the specified resource group.

### Directus Interface Login Issues

If you experience problems logging into the Directus interface:

- **Admin Credentials:** Ensure that the values of the environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD` match the credentials you are using to log in.
- **Environment Variable Changes:** If you make changes to environment variables after the initial deployment, restart the Directus container to apply the new configurations.

## Summary

This tutorial has guided you through setting up a resource group, configuring Azure Database for PostgreSQL, and deploying Directus using Docker on an Azure Web App.
