---
id: b322d05c-4d12-4f62-bfe3-aafe83cd0e11
slug: custom-domains
title: Custom Domains
authors: []
---
# Custom Domains

<!-- TODO: Image -->

Directus provides its own `<project-name>.directus.app` domain by default, but you can set your own domain for accessing your project.

::callout{type="info"}

Setting a custom domain is only available for enterprise projects. [Contact us](https://directus.io/contact) to get started with enterprise projects.

::

## Set a Custom Domain

Open your project's settings from the cloud dashboard. You will see your assigned `directus.app` domain.

By clicking on "Add Custom Domain", you can then enter your new domain. 

::callout{type="info"}

Custom domains must contain the format of `subdomain.your-custom-domain.tld`. You cannot use `directus` as a custom host domain.

::

Once set, you'll be prompted to enter a CNAME record for your DNS provider. Once that's done, and the changes have gone through, you'll receive an email from us confirming the custom domain has been set up.

::callout{type="info"}

You can only have one custom domain at a time. If you wish to change it, you'll have to remove it and set a new one.

::

## Remove a Custom Domain

Removing your custom domain is done by clicking on :icon{name="material-symbols:delete-outline-sharp"} next to it, and typing its name to confirm.