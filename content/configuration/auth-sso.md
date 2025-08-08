---
title: Authentication & SSO
description: Configuration for authentication methods, including local email/password, OAuth 2.0, OpenID, LDAP, and SAML.
navigation:
  title: Auth & SSO
---

:partial{content="config-env-vars"}

Directus offers a variety of authentication methods, including local email/password, OAuth 2.0, OpenID, LDAP, and SAML.

| Variable               | Description                                                                              | Default Value |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------- |
| `AUTH_PROVIDERS`       | A comma-separated list of auth providers. You can use any names you like for these keys. |               |
| `AUTH_DISABLE_DEFAULT` | Disable the default auth provider.                                                       | `false`       |

For each of the auth providers listed, you must provide the following configuration (variable name must be uppercase in these options):

| Variable                 | Description                                                                                                                                 | Default Value |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `AUTH_<PROVIDER>_DRIVER` | Which driver to use, either `local`, `oauth2`, `openid`, `ldap`, `saml`.                                                                    |               |
| `AUTH_<PROVIDER>_MODE`   | Whether to use `'cookie'` or `'session'` authentication mode when redirecting. Applies to the following drivers `oauth2`, `openid`, `saml`. | `session`     |

Based on your configured drivers, you must also provide additional variables, where `<PROVIDER>` is the capitalized name of the item in the `AUTH_PROVIDERS` value.

::callout{icon="material-symbols:warning-rounded" color="warning"}
**PUBLIC_URL**
`oauth2`, `openid`, `ldap`, and `saml` drivers rely on the `PUBLIC_URL` variable for redirecting. Ensure the variable is correctly configured.
::

## Local (`local`)

The default Directus email/password authentication flow. No additional configuration required.

## OAuth 2.0

| Variable                                    | Description                                                                                                                                                                                                                    | Default Value    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `AUTH_<PROVIDER>_CLIENT_ID`                 | Client identifier for the OAuth provider.                                                                                                                                                                                      |                  |
| `AUTH_<PROVIDER>_CLIENT_SECRET`             | Client secret for the OAuth provider.                                                                                                                                                                                          |                  |
| `AUTH_<PROVIDER>_CLIENT_*`                  | Client options overrides passed to the [underlying client](https://github.com/panva/openid-client).                                                                                                                            |                  |
| `AUTH_<PROVIDER>_SCOPE`                     | A white-space separated list of permissions to request.                                                                                                                                                                        | `email`          |
| `AUTH_<PROVIDER>_AUTHORIZE_URL`             | Authorization page URL of the OAuth provider.                                                                                                                                                                                  |                  |
| `AUTH_<PROVIDER>_ACCESS_URL`                | Access token URL of the OAuth provider.                                                                                                                                                                                        |                  |
| `AUTH_<PROVIDER>_PROFILE_URL`               | User profile URL of the OAuth provider.                                                                                                                                                                                        |                  |
| `AUTH_<PROVIDER>_IDENTIFIER_KEY`            | User profile identifier key <sup>[1]</sup>. Will default to `EMAIL_KEY`.                                                                                                                                                       |                  |
| `AUTH_<PROVIDER>_EMAIL_KEY`                 | User profile email key.                                                                                                                                                                                                        | `email`          |
| `AUTH_<PROVIDER>_FIRST_NAME_KEY`            | User profile first name key.                                                                                                                                                                                                   |                  |
| `AUTH_<PROVIDER>_LAST_NAME_KEY`             | User profile last name key.                                                                                                                                                                                                    |                  |
| `AUTH_<PROVIDER>_ALLOW_PUBLIC_REGISTRATION` | Automatically create accounts for authenticating users.                                                                                                                                                                        | `false`          |
| `AUTH_<PROVIDER>_DEFAULT_ROLE_ID`           | A Directus role ID to assign created users.                                                                                                                                                                                    |                  |
| `AUTH_<PROVIDER>_SYNC_USER_INFO`            | Set user's first name, last name and email from provider's user info on each login.                                                                                                                                            | `false`          |
| `AUTH_<PROVIDER>_ICON`                      | SVG icon to display with the login link. Can be a Material Icon or Font Awesome Social Icon.                                                                                                                                   | `account_circle` |
| `AUTH_<PROVIDER>_LABEL`                     | Text to be presented on SSO button within the Data Studio.                                                                                                                                                                     | `<PROVIDER>`     |
| `AUTH_<PROVIDER>_PARAMS`                    | Custom query parameters applied to the authorization URL.                                                                                                                                                                      |                  |
| `AUTH_<PROVIDER>_REDIRECT_ALLOW_LIST`       | A comma-separated list of external URLs (including paths) allowed for redirecting after successful login.                                                                                                                      |                  |
| `AUTH_<PROVIDER>_ROLE_MAPPING`              | A JSON object in the form of `{ "openid_group_name": "directus_role_id" }` that you can use to map OAuth claim groups to Directus roles <sup>[2]</sup>. If not specified, falls back to `AUTH_<PROVIDER>_DEFAULT_ROLE_ID` URL. |                  |
| `AUTH_<PROVIDER>_GROUP_CLAIM_NAME`          | The name of the OAuth claim that contains your user's groups.                                                                                                                                                                  | `groups`         |

<sup>[1]</sup> When authenticating, Directus will match the identifier value from the external user profile to a Directus users "External Identifier".

<sup>[2]</sup> As Directus only allows one role per user, evaluating stops after the first match. An OAuth user that is member of both e.g. developer and admin groups may be assigned different roles depending on the order that you specify your role-mapping in: In the following example said OAuth user will be assigned the role `directus_developer_role_id`

```
AUTH_<PROVIDER>_ROLE_MAPPING: json:{ "developer": "directus_developer_role_id", "admin": "directus_admin_role_id" }"
```

Whereas in the following example the OAuth user will be assigned the role `directus_admin_role_id`:

```
AUTH_<PROVIDER>_ROLE_MAPPING: json:{ "admin": "directus_admin_role_id", "developer": "directus_developer_role_id" }"
```

## OpenID Connect

OpenID Connect (OIDC) is an authentication protocol built on OAuth 2.0, and should be preferred over standard OAuth 2.0 where possible.

| Variable                                    | Description                                                                                                                                                                                                               | Default Value          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `AUTH_<PROVIDER>_CLIENT_ID`                 | Client identifier for the external service.                                                                                                                                                                               |                        |
| `AUTH_<PROVIDER>_CLIENT_SECRET`             | Client secret for the external service.                                                                                                                                                                                   |                        |
| `AUTH_<PROVIDER>_CLIENT_*`                  | Client options overrides passed to the [underlying client](https://github.com/panva/openid-client).                                                                                                                       |                        |
| `AUTH_<PROVIDER>_PRIVATE_KEYS`              | An array of JSON Web Key Set (JWKS) private keys used to sign client assertions <sup>[1]</sup>.                                                                                                                           |                        |
| `AUTH_<PROVIDER>_SCOPE`                     | A white-space separated list of permissions to request.                                                                                                                                                                   | `openid profile email` |
| `AUTH_<PROVIDER>_ISSUER_URL`                | OIDC `.well-known` discovery document URL of the external service.                                                                                                                                                        |                        |
| `AUTH_<PROVIDER>_IDENTIFIER_KEY`            | User profile identifier key <sup>[2]</sup>.                                                                                                                                                                               | `sub`<sup>[3]</sup>    |
| `AUTH_<PROVIDER>_ALLOW_PUBLIC_REGISTRATION` | Automatically create accounts for authenticating users.                                                                                                                                                                   | `false`                |
| `AUTH_<PROVIDER>_REQUIRE_VERIFIED_EMAIL`    | Require created users to have a verified email address.                                                                                                                                                                   | `false`                |
| `AUTH_<PROVIDER>_DEFAULT_ROLE_ID`           | A Directus role ID to assign created users.                                                                                                                                                                               |                        |
| `AUTH_<PROVIDER>_SYNC_USER_INFO`            | Set user's first name, last name and email from provider's user info on each login.                                                                                                                                       | `false`                |
| `AUTH_<PROVIDER>_ICON`                      | SVG icon to display with the login link. Can be a Material Icon or Font Awesome Social Icon.                                                                                                                              | `account_circle`       |
| `AUTH_<PROVIDER>_LABEL`                     | Text to be presented on SSO button within the Data Studio.                                                                                                                                                                | `<PROVIDER>`           |
| `AUTH_<PROVIDER>_PARAMS`                    | Custom query parameters applied to the authorization URL.                                                                                                                                                                 |                        |
| `AUTH_<PROVIDER>_REDIRECT_ALLOW_LIST`       | A comma-separated list of external URLs (including paths) allowed for redirecting after successful login.                                                                                                                 |                        |
| `AUTH_<PROVIDER>_ROLE_MAPPING`              | A JSON object in the form of `{ "openid_group_name": "directus_role_id" }` that you can use to map OpenID groups to Directus roles <sup>[4]</sup>. If not specified, falls back to `AUTH_<PROVIDER>_DEFAULT_ROLE_ID` URL. |                        |
| `AUTH_<PROVIDER>_GROUP_CLAIM_NAME`          | The name of the OIDC claim that contains your user's groups.                                                                                                                                                              | `groups`               |

<sup>[1]</sup> To ensure correct parsing the env must be prefixed with `json:`, additionally the `AUTH_<PROVIDER>_CLIENT_TOKEN_ENDPOINT_AUTH_METHOD` env must be set to `private_key_jwt`.
<sup>[2]</sup> When authenticating, Directus will match the identifier value from the external user profile to a Directus users "External Identifier".

<sup>[3]</sup> `sub` represents a unique user identifier defined by the OIDC provider. For users not relying on `PUBLIC_REGISTRATION` it is recommended to use a human-readable identifier, such as `email`.

<sup>[4]</sup> As Directus only allows one role per user, evaluating stops after the first match. An OIDC user that is member of both e.g. developer and admin groups may be assigned different roles depending on the order that you specify your role-mapping in: In the following example said OIDC user will be assigned the role `directus_developer_role_id`

```
AUTH_<PROVIDER>_ROLE_MAPPING: json:{ "developer": "directus_developer_role_id", "admin": "directus_admin_role_id" }"
```

Whereas in the following example the OIDC user will be assigned the role `directus_admin_role_id`:

```
AUTH_<PROVIDER>_ROLE_MAPPING: json:{ "admin": "directus_admin_role_id", "developer": "directus_developer_role_id" }"
```

## LDAP (`ldap`)

LDAP allows Active Directory users to authenticate and use Directus without having to be manually configured. User information and roles will be assigned from Active Directory.

| Variable                                 | Description                                                                         | Default Value |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------- |
| `AUTH_<PROVIDER>_CLIENT_URL`             | LDAP connection URL.                                                                |               |
| `AUTH_<PROVIDER>_BIND_DN`                | Bind user <sup>[1]</sup> distinguished name.                                        |               |
| `AUTH_<PROVIDER>_BIND_PASSWORD`          | Bind user password.                                                                 |               |
| `AUTH_<PROVIDER>_USER_DN`                | Directory path containing users.                                                    |               |
| `AUTH_<PROVIDER>_USER_ATTRIBUTE`         | Attribute to identify the user.                                                     | `cn`          |
| `AUTH_<PROVIDER>_USER_SCOPE`             | Scope of the user search, either `base`, `one`, `sub` <sup>[2]</sup>.               | `one`         |
| `AUTH_<PROVIDER>_MAIL_ATTRIBUTE`         | User email attribute.                                                               | `mail`        |
| `AUTH_<PROVIDER>_FIRST_NAME_ATTRIBUTE`   | User first name attribute.                                                          | `givenName`   |
| `AUTH_<PROVIDER>_LAST_NAME_ATTRIBUTE`    | User last name attribute.                                                           | `sn`          |
| `AUTH_<PROVIDER>_GROUP_DN`<sup>[3]</sup> | Directory path containing groups.                                                   |               |
| `AUTH_<PROVIDER>_GROUP_ATTRIBUTE`        | Attribute to identify user as a member of a group.                                  | `member`      |
| `AUTH_<PROVIDER>_GROUP_SCOPE`            | Scope of the group search, either `base`, `one`, `sub` <sup>[2]</sup>.              | `one`         |
| `AUTH_<PROVIDER>_DEFAULT_ROLE_ID`        | A fallback Directus role ID to assign created users.                                |               |
| `AUTH_<PROVIDER>_SYNC_USER_INFO`         | Set user's first name, last name and email from provider's user info on each login. | `false`       |

<sup>[1]</sup> The bind user must have permission to query users and groups to perform authentication. Anonymous binding
can by achieved by setting an empty value for `BIND_DN` and `BIND_PASSWORD`.

<sup>[2]</sup> The scope defines the following behaviors:

- `base`: Limits the scope to a single object defined by the associated DN.
- `one`: Searches all objects within the associated DN.
- `sub`: Searches all objects and sub-objects within the associated DN.

<sup>[3]</sup> If `GROUP_DN` is specified, the user's role will always be updated on authentication to a matching group
configured in AD, or fallback to the `DEFAULT_ROLE_ID`.

## SAML

SAML is an open-standard, XML-based authentication framework for authentication and authorization between two entities without a password.

- Service provider (SP) agrees to trust the identity provider to authenticate users.
- Identity provider (IdP) authenticates users and provides to service providers an authentication assertion that indicates a user has been authenticated.

| Variable                                    | Description                                                                                               | Default Value                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `AUTH_<PROVIDER>_SP_metadata`               | String containing XML metadata for service provider                                                       |                                                                        |
| `AUTH_<PROVIDER>_IDP_metadata`              | String containing XML metadata for identity provider                                                      |                                                                        |
| `AUTH_<PROVIDER>_ALLOW_PUBLIC_REGISTRATION` | Automatically create accounts for authenticating users.                                                   | `false`                                                                |
| `AUTH_<PROVIDER>_DEFAULT_ROLE_ID`           | A Directus role ID to assign created users.                                                               |                                                                        |
| `AUTH_<PROVIDER>_IDENTIFIER_KEY`            | User profile identifier key <sup>[1]</sup>.                                                               | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier` |
| `AUTH_<PROVIDER>_EMAIL_KEY`                 | User profile email key.                                                                                   | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`   |
| `AUTH_<PROVIDER>_GIVEN_NAME_KEY`            | User first name attribute.                                                                                | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname`      |
| `AUTH_<PROVIDER>_FAMILY_NAME_KEY`           | User last name attribute.                                                                                 | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname`        |
| `AUTH_<PROVIDER>_REDIRECT_ALLOW_LIST`       | A comma-separated list of external URLs (including paths) allowed for redirecting after successful login. |                                                                        |

<sup>[1]</sup> When authenticating, Directus will match the identifier value from the external user profile to a Directus users "External Identifier".

The `SP_metadata` and `IDP_metadata` variables should be set to the XML metadata provided by the service provider and identity provider respectively.

## Multiple Auth Providers

You can configure multiple providers for handling authentication in Directus. This allows for different options when logging in. To do this, provide a comma-separated list of provider names, and a config block for each provider. For example;

```bash
AUTH_PROVIDERS="google,facebook"

AUTH_GOOGLE_DRIVER="openid"
AUTH_GOOGLE_CLIENT_ID="830d...29sd"
AUTH_GOOGLE_CLIENT_SECRET="la23...4k2l"
AUTH_GOOGLE_ISSUER_URL="https://accounts.google.com/.well-known/openid-configuration"
AUTH_GOOGLE_IDENTIFIER_KEY="email"
AUTH_GOOGLE_ICON="google"
AUTH_GOOGLE_LABEL="Google"

AUTH_FACEBOOK_DRIVER="oauth2"
AUTH_FACEBOOK_CLIENT_ID="830d...29sd"
AUTH_FACEBOOK_CLIENT_SECRET="jd8x...685z"
AUTH_FACEBOOK_AUTHORIZE_URL="https://www.facebook.com/dialog/oauth"
AUTH_FACEBOOK_ACCESS_URL="https://graph.facebook.com/oauth/access_token"
AUTH_FACEBOOK_PROFILE_URL="https://graph.facebook.com/me?fields=email"
AUTH_FACEBOOK_ICON="facebook"
AUTH_FACEBOOK_LABEL="Facebook"
```

::callout{icon="material-symbols:info-outline"}
**Multiple Providers**
Directus users can only authenticate using the auth provider they are created with. It is not possible to authenticate with multiple providers for the same user.
::

## Multiple Auth Providers

Below is a collection of example Directus configurations for integrating with various OpenID, OAuth 2.0 and SAML platforms. Due to the large number of available SSO platforms, this list will only cover the most common configurations. Contributions to expand and maintain the list are encouraged.

### OpenID

#### Apple

```
AUTH_APPLE_DRIVER="openid"
AUTH_APPLE_CLIENT_ID="..."
AUTH_APPLE_CLIENT_SECRET="..."
AUTH_APPLE_ISSUER_URL="https://appleid.apple.com/.well-known/openid-configuration"
AUTH_APPLE_SCOPE="name email"
AUTH_APPLE_IDENTIFIER_KEY="email"
AUTH_APPLE_PARAMS="{"response_mode":"form_post"}"
```

#### Auth0

```
AUTH_AUTH0_DRIVER="openid"
AUTH_AUTH0_CLIENT_ID="..."
AUTH_AUTH0_CLIENT_SECRET="..."
AUTH_AUTH0_ISSUER_URL="https://<your_auth0_domain>/.well-known/openid-configuration"
AUTH_AUTH0_IDENTIFIER_KEY="email"
```

#### Google

```
AUTH_GOOGLE_DRIVER="openid"
AUTH_GOOGLE_CLIENT_ID="..."
AUTH_GOOGLE_CLIENT_SECRET="..."
AUTH_GOOGLE_ISSUER_URL="https://accounts.google.com/.well-known/openid-configuration"
AUTH_GOOGLE_IDENTIFIER_KEY="email"
```

#### Keycloak

```
AUTH_KEYCLOAK_DRIVER="openid"
AUTH_KEYCLOAK_CLIENT_ID="..."
AUTH_KEYCLOAK_CLIENT_SECRET="..."
# For Keycloak < 18.0.0
AUTH_KEYCLOAK_ISSUER_URL="http://<your_keycloak_domain>/auth/realms/<your_keycloak_realm>/.well-known/openid-configuration"
# For Keycloak >= 18.0.0
AUTH_KEYCLOAK_ISSUER_URL="http://<your_keycloak_domain>/realms/<your_keycloak_realm>/.well-known/openid-configuration"
AUTH_KEYCLOAK_IDENTIFIER_KEY="email"
```

#### Microsoft Azure

```
AUTH_MICROSOFT_DRIVER="openid"
AUTH_MICROSOFT_CLIENT_ID="..."
AUTH_MICROSOFT_CLIENT_SECRET="..."
AUTH_MICROSOFT_ISSUER_URL="https://login.microsoftonline.com/<your_tenant_id>/v2.0/.well-known/openid-configuration"
AUTH_MICROSOFT_IDENTIFIER_KEY="email"
```

#### Okta

```
AUTH_OKTA_DRIVER="openid"
AUTH_OKTA_CLIENT_ID="..."
AUTH_OKTA_CLIENT_SECRET= "..."
AUTH_OKTA_ISSUER_URL="https://<your_okta_domain>/.well-known/openid-configuration"
AUTH_OKTA_IDENTIFIER_KEY="email"
```

#### Twitch

```
AUTH_TWITCH_DRIVER="openid"
AUTH_TWITCH_CLIENT_ID="..."
AUTH_TWITCH_CLIENT_SECRET="..."
AUTH_TWITCH_ISSUER_URL="https://id.twitch.tv/oauth2/.well-known/openid-configuration"
AUTH_TWITCH_SCOPE="openid user:read:email"
AUTH_TWITCH_PARAMS__CLAIMS="string:{"id_token":{"email":null}}"
AUTH_TWITCH_IDENTIFIER_KEY="email"
```

### OAuth 2.0

#### Discord

```
AUTH_DISCORD_DRIVER="oauth2"
AUTH_DISCORD_CLIENT_ID="..."
AUTH_DISCORD_CLIENT_SECRET="..."
AUTH_DISCORD_AUTHORIZE_URL="https://discord.com/api/oauth2/authorize"
AUTH_DISCORD_ACCESS_URL="https://discord.com/api/oauth2/token"
AUTH_DISCORD_PROFILE_URL="https://discord.com/api/users/@me"
```

#### Facebook

```
AUTH_FACEBOOK_DRIVER="oauth2"
AUTH_FACEBOOK_CLIENT_ID="..."
AUTH_FACEBOOK_CLIENT_SECRET="..."
AUTH_FACEBOOK_AUTHORIZE_URL="https://www.facebook.com/dialog/oauth"
AUTH_FACEBOOK_ACCESS_URL="https://graph.facebook.com/oauth/access_token"
AUTH_FACEBOOK_PROFILE_URL="https://graph.facebook.com/me?fields=email"
```

#### GitHub

```
AUTH_GITHUB_DRIVER="oauth2"
AUTH_GITHUB_CLIENT_ID="..."
AUTH_GITHUB_CLIENT_SECRET="..."
AUTH_GITHUB_AUTHORIZE_URL="https://github.com/login/oauth/authorize"
AUTH_GITHUB_ACCESS_URL="https://github.com/login/oauth/access_token"
AUTH_GITHUB_PROFILE_URL="https://api.github.com/user"
```

::callout{icon="material-symbols:warning-rounded" color="warning"}

If the authenticating user has not marked their email as "public" in GitHub, it will not be accessible by Directus.

::

#### Twitter

```
AUTH_TWITTER_DRIVER="oauth2"
AUTH_TWITTER_CLIENT_ID="..."
AUTH_TWITTER_CLIENT_SECRET="-..."
AUTH_TWITTER_AUTHORIZE_URL="https://twitter.com/i/oauth2/authorize"
AUTH_TWITTER_ACCESS_URL="https://api.twitter.com/2/oauth2/token"
AUTH_TWITTER_PROFILE_URL="https://api.twitter.com/2/users/me"
AUTH_TWITTER_IDENTIFIER_KEY="data.username"
AUTH_TWITTER_SCOPE="tweet.read users.read"
```

::callout{icon="material-symbols:warning-rounded" color="warning"}

Twitter does not provide "email" so we define "username" as the identifier.

::

### SAML

#### AWS

```
AUTH_AWS_DRIVER="saml"
AUTH_AWS_IDP_metadata="{Your IAM Identity Center SAML metadata file}"
AUTH_AWS_SP_metadata=""
AUTH_AWS_ALLOW_PUBLIC_REGISTRATION="true"
AUTH_AWS_DEFAULT_ROLE_ID="{Needs to be a valid role on the instance}"
AUTH_AWS_IDENTIFIER_KEY="email"
AUTH_AWS_EMAIL_KEY="email"
```

::callout{icon="material-symbols:warning-rounded" color="warning"}
**Metadata**

- AWS IAM Docs are not that verbose. Users have found that the `SP_metadata` environment variable can be supplied empty.
- Users have found that replacing
  `<md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://your-soo-portal-url"/>`
  in the IAM Identity Center SAML metadata file with your AWS Portal URL is a fix for getting the 'Login With SSO'
  button on Directus to work, rather the default redirect from AWS.
- Directus expects `<?xml version="1.0" encoding="UTF-8"?>` to be removed from the start of the XML.

::

**Mapping:**

Maps the email address into Directus as `external_identifier`:

| User attribute in the application | Maps to this string value or user attribute in IAM Identity Center | type           |
| --------------------------------- | ------------------------------------------------------------------ | -------------- |
| `Subject`                         | `${user:email}`                                                    | `emailAddress` |
| `email`                           | `${user:email}`                                                    | `unspecified`  |

**Config:**

- Relay state: `admin/login`
- Application ACS URL: `https://your-directus-instance/auth/login/aws/acs`

#### Google

```
AUTH_GOOGLE_DRIVER="saml"
AUTH_GOOGLE_IDP_metadata="{Your SAML metadata file from Google}"
AUTH_GOOGLE_SP_metadata="{Create your own SAML metadata file, see example below}"
AUTH_GOOGLE_ALLOW_PUBLIC_REGISTRATION="true"
AUTH_GOOGLE_DEFAULT_ROLE_ID="{Needs to be a valid role on the instance}"
AUTH_GOOGLE_IDENTIFIER_KEY="email"
AUTH_GOOGLE_EMAIL_KEY="email"
```

::callout{icon="material-symbols:warning-rounded" color="warning"}
**SP Metadata**

- The `entityID` should be the same as the one configured in Google in the `EntityDescriptor` tag
- The `Location` should be the ACS URL of your Directus instance in the format of
  `https://your-directus-instance/auth/login/google/acs`
- Directus expects `<?xml version="1.0" encoding="UTF-8"?>` to be removed from the start of the XML.

**Example**

```xml
<EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" entityID="SHOULD_MATCH_GOOGLE_CONFIG">
  <SPSSODescriptor WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService isDefault="true" index="0" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="YOUR_DOMAIN/auth/login/google/acs"/>
  </SPSSODescriptor>
</EntityDescriptor>
```

::
