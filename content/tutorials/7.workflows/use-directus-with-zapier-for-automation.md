---
id: use-directus-with-zapier-for-automation
title: Use Directus with Zapier for Automation
description: Connect Directus with Zapier to automate workflows, sync data, and integrate your CMS with thousands of other apps using the Directus Zapier integration.
technologies:
  - zapier
---

Connect your Directus instance with Zapier to automate workflows, sync data between systems, and build powerful integrations with 6,000+ apps.

::callout{icon="heroicons-outline:rocket-launch"}
**Quick Start**

1. **Connect your account**: In Zapier, search for "Directus" and connect your Directus URL and API token
2. **Create a Zap**: Use Directus triggers or actions in your workflows
3. **Start automating**: Connect Directus to thousands of other apps
::

## Available Integrations

The Directus Zapier integration provides two main components:

- **Directus Actions**: Perform CRUD operations on items, users, and files
- **Directus Triggers**: Automatically start Zaps when events occur in Directus

## Getting Started

### Connect Your Directus Account

1. In Zapier, click **Create Zap**
2. Search for **"Directus"** in the trigger or action step
3. Click **Connect a new account** (or select an existing connection)
4. Enter:
   - **Directus URL**: Your Directus instance URL (must start with `https://`)
   - **Static Access Token**: Your Directus API token
5. Click **Yes, continue** to test the connection

#### Getting Your API Token

1. In Directus, go to **Users**
2. Select or create a user for Zapier integration
3. Open the user's detail page
4. Scroll to **Token** section
5. Click **Generate Token**
6. Copy the token and paste into Zapier
7. **Important**: Click the checkmark (✓) to save

::callout{icon="material-symbols:info-outline"}
**Permissions**
<br>
**Admin Token (Recommended for Getting Started)**
<br>
Many operations, including creating webhooks for triggers, require Administrator permissions. Assign the Administrator role to the user for the easiest setup and full access to all collections and features.

<br>

**Custom Role (For Production)**
<br>
For better security, create a custom role with specific permissions. This allows you to limit access to only the collections and operations your workflows need. The token inherits the user's role permissions, so you can lock down access while still allowing necessary operations.
::

## Documentation

**[Working with Directus Actions →](/tutorials/workflows/directus-zapier-actions)**

Perform operations on your Directus data: create, read, update, and delete items, users, and files.

**[Using Directus Triggers →](/tutorials/workflows/directus-zapier-triggers)**

Set up automated workflows that trigger when events happen in Directus.

**[Advanced Features →](/tutorials/workflows/directus-zapier-advanced)**

Use raw request actions, advanced filtering, and custom API calls with Code by Zapier and Webhooks.

