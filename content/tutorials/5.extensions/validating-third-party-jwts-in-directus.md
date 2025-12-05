---
slug: validating-third-party-jwts-in-directus
title: Validating Third-Party JWTs in Directus (with Okta)
description: Learn how to translate third part JWT's to Directus accountability
navigation: false
authors:
  - name: Judd Abraham
    title: Senior Software Engineer
---

Integrating external identity providers (e.g. Okta) with Directus often results in the need to accept a third-party JWT, validate it and translate it into a Directus **Accountability** object. This allows clients to authenticate with their external provider while Directus still enforcing its access controls.

This guide walks through implementing this flow using Directus's `authenticate` hook. This guide assumes the provider exposes a [JWK](https://www.rfc-editor.org/rfc/rfc7517) endpoint.

## 1. Create an `authenticate` filter hook

Directus exposes an `authenticate` [filter hook](/guides/extensions/api-extensions/hooks#filter) that lets us override its authentication logic. This hook runs on every request that requires authentication.

We will [initialize a new hook extension](/guides/extensions/quickstart#initializing-an-extension) named `okta-jwt` written in typescript. Once that is generated replace the contents of `index.ts` with the following code snippet:

```ts
import { defineHook } from "@directus/extensions-sdk";

export default defineHook(({ filter }, { logger }) => {
  filter("authenticate", async (defaultAccountability, meta, context) => {
    //
  });
});
```

## 2. Accessing the Incoming JWT

Now that we've set up the hook our next step is to read the JWT passed with the request.

In our case it is sent as a Bearer token and therefore will be accessible on the request's `token` property. The original request object is provided under the hooks `meta` property.

```ts
import { defineHook } from "@directus/extensions-sdk";

export default defineHook(({ filter }, { logger }) => {
  filter("authenticate", async (defaultAccountability, meta, context) => {
  // Access 3rd party JWT
  const token = meta.req.token;
});
```

## 3. Decoding the JWT

Before we can verify the JWT, we need to obtain the secret that was used to sign it. For that, we need to check the token's `kid` (Key ID) header, which identifies the public key used for the signature.

We will use the [`jwt-decode`](https://github.com/auth0/jwt-decode) library to handle the decoding.

```ts
import { InvalidTokenError } from "@directus/errors";
import { defineHook } from "@directus/extensions-sdk";
import { jwtDecode } from "jwt-decode";

export default defineHook(({ filter }, { logger }) => {
  filter("authenticate", async (defaultAccountability, meta, context) => {
    // ... (code from step 2) ...

    // Attempt to decode payload for later user
    let payload;
    try {
      payload = await jwtDecode(token);
    } catch (error) {
      logger.error(error);
      //  Invalid JWT, have directus resume its normal flow
      return;
    }

    // Ignore Directus issued tokens
    if (payload.iss === "directus") return;

    // Attempt to access the `kid` header, required for verification
    let headers;
    try {
      headers = await jwtDecode(token, { header: true });
    } catch (error) {
      logger.error(error);
      //  Invalid JWT, have directus resume its normal flow
      return;
    }

    const kid = headers.kid;

    // 'kid' is required to determine the signing key
    if (!kid) {
      logger.error("'kid' is required");
      throw new InvalidTokenError();
    }
  });
});
```

## 4. Fetching the Signing Key

Now that we have the header we fetch the secret that used for the token. The JWK endpoint for Okta is `https://<your-okta-domain>/oauth2/default/v1/keys`.

We will use the [`jwks-rsa`](https://github.com/auth0/node-jwks-rsa) library to handle the retrieval of the secret.

```ts
import { InvalidTokenError, InvalidCredentialsError } from "@directus/errors";
import { defineHook } from "@directus/extensions-sdk";
import { jwtDecode } from "jwt-decode";
import jwksClient from "jwks-rsa";

export default defineHook(({ filter }, { logger }) => {
  filter("authenticate", async (defaultAccountability, meta, context) => {
    // ... (code from step 2-3) ...

    const client = jwksClient({
      jwksUri: "https://<your-okta-domain>/oauth2/default/v1/keys",
    });

    // Fetch signing key from JWKS and generate corresponding secret
    let secret;
    try {
      const key = await client.getSigningKey(kid);
      secret = key.getPublicKey();
    } catch (error) {
      logger.error(error);
      throw new InvalidCredentialsError();
    }

    if (!secret) {
      logger.error("'secret' is required");
      throw new InvalidCredentialsError();
    }
  });
});
```

## 5. Verifying the JWT with the Signing Key

After obtaining the secret we can verify the token is authenticate and has not been tampered with.

To further strength security, we will also validate any additional information we know, such as `alogrithm`, `issuer` and `audience` and will add those as verification requirements.

In our case we are using okta with the defualt authorization server so the issuer is `https://<your-okta-domain>/oauth2/default` and the algorithm will be `RS256`.

We will use the [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken) library to handle the verification.

```ts
import {
  InvalidCredentialsError,
  InvalidTokenError,
  ServiceUnavailableError,
  TokenExpiredError,
} from "@directus/errors";
import { defineHook } from "@directus/extensions-sdk";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { jwtDecode } from "jwt-decode";

export default defineHook(({ filter }, { logger }) => {
  filter("authenticate", async (defaultAccountability, meta, context) => {
    // ... (code from step 2-4) ...

    // Attempt to verify and decode JWT payload.
    // It will also auto verify exp, ensure system is in sync with time.
    try {
      await jwt.verify(token, secret, {
        // always validate the issuer
        issuer: "https://<your-okta-domain>/oauth2/default",
        // if applicable always validate the audience
        // audience: "directus",
        // Always restrict to the algorithms you need
        algorithms: ["RS256"],
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError();
      }
      throw new ServiceUnavailableError({
        service: "jwt",
        reason: `Couldn't verify token.`,
      });
    }

    // Payload is expected to be an object
    if (typeof payload === "string") {
      throw new InvalidTokenError();
    }
  });
});
```

At this point, the JWT is verified and we can trust its claims.

## 6. Processing the payload

### **Extracting Custom Claims**

After verifying the JWT, the payload contains both standard claims and any custom claims your identity provider has added.

Standard claims available in most JWTs:

- `sub` - Subject identifier (user/service ID)
- `iss` - Issuer (who issued the token)
- `aud` - Audience (intended recipient)
- `exp` - Expiration time
- `iat` - Issued at time

Custom claims vary by provider. For example, Auth0 equires URL-namespaced claim names, while Okta allows simple property names.

### **Mapping JWT Claims to Directus Accountability**

The claims you extract from the JWT—whether standard or custom—determine how you map external identities to Directus users and roles.

Standard claims (e.g. `sub`, `iss` etc) can be sufficient for basic mappings (e.g., using `sub` as an external identifier), but custom claims provide more flexibility for complex scenarios. By extracting the right claims, you can:

- Automatically provision users based on token identity
- Map external roles, scopes, or permissions to Directus roles
- Enforce access control without manually creating users for each service

### Mapping Strategies

With the JWT payload verified we can map its claims to a Directus accountability.

Their are multiple ways to achieve this but two common patters exist:

- [Option 1 - Lookup User Dynamically Using a Claim](#option-1---lookup-user-dynamically-using-a-claim)
- [Option 2 - Use a Static Mapping](#option-2--use-a-static-mapping)
- [Option 3 - Auto-Provision Users](#option-3---auto-provision-users)

#### Option 1 - Lookup User Dynamically Using a Claim

We match a directus users `external_identifier` with the JWt's `sub` property, using their information to build the accountability

```ts
import {
  InvalidCredentialsError,
  InvalidTokenError,
  ServiceUnavailableError,
  TokenExpiredError,
} from "@directus/errors";
import { defineHook } from "@directus/extensions-sdk";
import { Accountability } from "@directus/types";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { jwtDecode } from "jwt-decode";
import { fetchRolesTree, fetchGlobalAccess } from "@directus/utils/node";

export default defineHook(({ filter }, { logger }) => {
  filter("authenticate", async (defaultAccountability, meta, context) => {
    // ... (code from step 2-5) ...

    // Process validated payload
    const { database } = context;

    // Determine user and/or role via external_identifier
    // Use direct query as user/accountability is not known
    const user = await database
      .select("directus_users.id", "directus_users.role")
      .from("directus_users")
      .where({
        "directus_users.external_identifier": payload.sub,
        status: "active",
      })
      .first();

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // build accountability
    // Ensure we do not mutate the original acc
    const accountability = Object.assign(
      {},
      defaultAccountability
    ) as Accountability;

    accountability.user = user.id;
    accountability.role = user.role;
    accountability.roles = await fetchRolesTree(user.role, { knex: database });

    const { admin, app } = await fetchGlobalAccess(accountability, {
      knex: database,
    });
    accountability.admin = admin;
    accountability.app = app;

    return accountability;
  });
});
```

This approach is flexible and works well with automated provisioning.

#### Option 2 — Use a Static Mapping

If the mapping between the claim and user id/role is known ahead of time, you can avoid DB queries entirely.

```ts
import {
  InvalidCredentialsError,
  InvalidTokenError,
  ServiceUnavailableError,
  TokenExpiredError,
} from "@directus/errors";
import { defineHook } from "@directus/extensions-sdk";
import { Accountability } from "@directus/types";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { jwtDecode } from "jwt-decode";
import { fetchRolesTree, fetchGlobalAccess } from "@directus/utils/node";

export default defineHook(({ filter }, { logger }) => {
  filter("authenticate", async (defaultAccountability, meta, context) => {
    // ... (code from step 2-5) ...

    // Process validated payload
    const { database } = context;

    // Determine user and role via mapping
    const mapping = new Map([
      [
        "sub1",
        {
          id: "00783989-9ba3-48fc-b636-d7fcb7dde46a",
          role: "6b5ef978-72a7-42f9-b11d-b58bcb9b2359",
        },
      ],
      ["sub2", { id: "00783989-9ba3-48fc-b636-d7fcb7dde46a", role: null }],
    ]);

    const user = mapping.get(payload.sub);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // build accountability
    // Ensure we do not mutate the original acc
    const accountability = Object.assign(
      {},
      defaultAccountability
    ) as Accountability;

    accountability.user = user.id;
    accountability.role = user.role;
    accountability.roles = await fetchRolesTree(user.role, { knex: database });

    const { admin, app } = await fetchGlobalAccess(accountability, {
      knex: database,
    });

    accountability.admin = admin;
    accountability.app = app;

    return accountability;
  });
});
```

This method is best for small systems or service accounts

#### Option 3 - Auto-Provision Users

This method combines user lookup with auto-provisioning for dynamic service account management.

```ts
import {
  InvalidCredentialsError,
  InvalidTokenError,
  ServiceUnavailableError,
  TokenExpiredError,
} from "@directus/errors";
import { defineHook } from "@directus/extensions-sdk";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { jwtDecode } from "jwt-decode";
import { fetchRolesTree, fetchGlobalAccess } from "@directus/utils/node";

export default defineHook(({ filter }, { logger }) => {
  filter("authenticate", async (defaultAccountability, meta, context) => {
    // ... (code from step 2-5) ...

    // Extract custom claims
    const serviceName = payload["https://directus.io/service-name"];
    const serviceScope = payload["https://directus.io/service-scope"];

    // Map scope to role
    const scopeToRoleMap = {
      "read:items": "44bc7044-f3b9-4ea5-9e12-b231e90e953d",
      "write:items": "5c8e1d2a-7f3b-4a9c-8d6e-9b4f2a1c3e5d",
    };

    const roleId = scopeToRoleMap[serviceScope];

    if (!roleId) {
      throw new InvalidCredentialsError();
    }

    const { database, services } = context;

    // Try to find existing user by external_identifier
    let user = await database
      .select("directus_users.id", "directus_users.role")
      .from("directus_users")
      .where({
        "directus_users.external_identifier": serviceName,
        status: "active",
      })
      .first();

    // Auto-provision user if doesn't exist
    if (!user) {
      const usersService = new services.UsersService(context);
      const userPayload = {
        external_identifier: serviceName,
        email: `${serviceName}@service.local`,
        first_name: serviceName,
        role: roleId,
        status: "active",
        provider: "<your-identity-provider>",
      };

      const userId = await usersService.createOne(userPayload);

      user = {
        id: userId,
        ...userPayload,
      };
    }

    // Build accountability
    const accountability = Object.assign({}, defaultAccountability);
    accountability.user = user.id;
    accountability.role = user.role;
    accountability.roles = await fetchRolesTree(user.role, { knex: database });

    const { admin, app } = await fetchGlobalAccess(accountability, {
      knex: database,
    });

    accountability.admin = admin;
    accountability.app = app;

    return accountability;
  });
});
```

## Wrapping up

After your `authenticate` hook returns a custom Accountability object, Directus takes over and applies the necessary Access Control exactly as if the user had requested with a Directus JWT token.

### Possible Enhancements

This guide covers the basics. For a production-ready setup, you may want to:

- Load constants (e.g. jwks_uri, issuer etc) from environment variables.
- Cache the JWK response according to its expected rotation interval.
- Support multiple identity providers.
