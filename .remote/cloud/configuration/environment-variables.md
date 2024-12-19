---
id: f9d5e191-faf0-4dc6-9065-6e115714ff8d
slug: environment-variables
title: Environment Variables
authors: []
---
# Environment Variables

You can configure your Directus project using a number of environment variable presets which can be configured in the Cloud dashboard.

![Cloud dashboard project configuration screen showing a number of configurable settings such as CORS and maximum file upload size.](https://product-team.directus.app/assets/363335e4-59bb-4233-bca5-94bb1f39f3fd.png)

::callout{type="info"}
Once you save these changes, your project will redeploy.
::

## Available Configuration Options

While the Cloud dashboard provides configuration via a UI with some preset options, the options relate to the following environment variables:

### Files

* `FILES_MAX_UPLOAD_SIZE` 

[Read more about Upload Limit environment variables.](/configuration/files)

### Security & Limits

* `PASSWORD_RESET_URL_ALLOW_LIST`
* `USER_INVITE_URL_ALLOW_LIST`
* `USER_REGISTER_URL_ALLOW_LIST`

[Read more about Security environment variables.](/configuration/security-limits)

### CORS

* `CORS_ENABLED` 
* `CORS_ORIGIN`
* `CORS_METHODS`
* `CORS_ALLOWED_HEADERS` 
* `CORS_EXPOSED_HEADERS`
* `CORS_CREDENTIALS` 
* `CORS_MAX_AGE`

[Read more about CORS environment variables.](/configuration/security-limits)