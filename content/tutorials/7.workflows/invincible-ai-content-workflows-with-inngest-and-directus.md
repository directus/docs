---
slug: invincible-ai-content-workflows-with-inngest-and-directus
title: Invincible AI content workflows with Inngest and Directus
authors:
  - name: Bryant Gillespie
    title: Developer Advocate
description: Learn how to configure integration Directus and Inngest to build durable workflows for any scale.
---

This article demonstrates how to enhance your Directus projects with Inngest to build powerful AI-driven content workflows at scale.

The Directus + Inngest integration provides impressive capabilities for handling complex AI workflows. This guide will show you how to implement this in your own projects.

![Inngest Website Thumbnail](/img/inngest-website-thumbnail.png)

---

## What is Inngest?

[Inngest](https://www.inngest.com?ref=directus_docs) is a powerful platform for building and orchestrating backend workflows and step functions at any scale. It elegantly solves some of the most challenging aspects of building reliable background processes:

- **Durable Functions**: Inngest functions continue execution even during intermittent failures or disconnections.
- **Automatic Retries**: Built-in retry mechanisms that intelligently handle errors.
- **Step-based Workflows**: Break complex processes into manageable steps that can be tracked individually.
- **State Management**: Automatically persists function state between steps so you don't need separate databases.
- **Parallel Execution**: Run operations concurrently for better performance.
- **Flow Control**: Features like throttling, concurrency limits, and priorities to manage execution.

What makes Inngest especially valuable for AI workflows is its ability to handle long-running, resource-intensive processes reliably. AI operations often involve multiple steps (data preparation, model inference, result processing) that need to be coordinated, with appropriate error handling and retries at each stage.

Most importantly, Inngest eliminates the need to manage complex queue infrastructure. You simply write functions in your existing codebase using Inngest's SDK, and it handles all the orchestration for you. This approach is particularly valuable with AI workflows, which often require careful state management and can benefit from the step-by-step execution model.

**Here's a quick fictional example of an Inngest function.**

```tsx
// Example of an Inngest function with steps
export const analyzeContent = inngest.createFunction(
  { id: "analyze-content" },
  { event: "content/created" },
  async ({ event, step }) => {
    // Steps are atomic, durable operations that retry on failure
    const extractedText = await step.run("extract-text", async () => {
      return textExtractor.process(event.data.documentUrl)
    })

    // State is automatically preserved between steps
    const analysis = await step.run("analyze-with-ai", async () => {
      return aiService.analyze(extractedText)
    })

    // Final results can be saved or further processed
    return analysis
  }
)

```

The platform also offers a developer-friendly experience with excellent local development tools, comprehensive observability, and tools for debugging and recovery when things go wrong in production.

## The Directus + Inngest Integration: Beyond Flows

While Directus already includes its own [workflow automation system (Flows)](/guides/automate/flows), Inngest complements it by handling scenarios that Flows wasn't designed for. Directus Flows excels at short-lived automations like sending notifications or processing simple data operations, but AI workflows typically require more resilience and computational power.

Inngest is the perfect companion when you need:

- **Long-running processes** that might take minutes or hours (versus Flows' seconds).
- **Complex, multi-step AI workflows** with dependencies and state management.
- **Compute-intensive tasks** that shouldn't block your main application.
- **Sophisticated error handling** with automatic retries.
- **Resource isolation** to keep your Directus instance responsive.

By integrating Directus with Inngest, you create a content management system capable of sophisticated AI operations like content translation, image analysis, or generative AI tasks while maintaining performance. You can even trigger Inngest functions from Directus Flows, combining the visual simplicity of Flows with the computational power of Inngest for heavy processing.

The following sections detail the technical implementation.

---

## Implementation Guide


::callout{icon="material-symbols:info-outline"}

To implement this integration, you'll want to have

- A basic understanding of [Directus Extensions](/guides/extensions/overview).

::


This guide walks through the complete implementation process step by step, following a logical development workflow.

### Set Up Your Directus Environment

First, create a new directory locally and create a Docker Compose setup for a Directus instance with Inngest:

```yaml
# docker-compose.yml
name: directus-inngest
services:
  database:
    container_name: directus-inngest-database
    image: postgis/postgis:13-master
    ports:
      - 5432:5432
    volumes:
      - ./directus/data/database:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: directus
      POSTGRES_DB: directus
    networks:
      - backend-network

  cache:
    container_name: directus-inngest-cache
    image: redis:6
    networks:
      - backend-network

  directus:
    container_name: directus-inngest
    image: directus/directus:latest
    ports:
      - 8055:8055
    volumes:
      - ./directus/uploads:/directus/uploads
      - ./directus/extensions:/directus/extensions
      # Mount the Inngest extension into Directus
      - ./queue:/directus/extensions/queue
    depends_on:
      - cache
      - database
    networks:
      - backend-network
    environment:
      KEY: 'your-directus-key'
      SECRET: 'your-directus-secret'

      DB_CLIENT: 'pg'
      DB_HOST: 'database'
      DB_PORT: '5432'
      DB_DATABASE: 'directus'
      DB_USER: 'directus'
      DB_PASSWORD: 'directus'

      # Inngest Configuration
      INNGEST_BASE_URL: 'http://inngest:8288'
      INNGEST_DEV: 'true'
      INNGEST_EVENT_KEY: 'your-event-key-here'
      INNGEST_SIGNING_KEY: 'your-signing-key-here'

      # Enable auto reload for development
      EXTENSIONS_AUTO_RELOAD: 'true'

  # Inngest Dev Server for local development
  inngest:
    container_name: directus-inngest-inngest
    image: inngest/inngest:latest
    command: 'inngest dev -u http://directus:8055/inngest'
    ports:
      - '8288:8288'
    networks:
      - backend-network

networks:
  backend-network:
    driver: bridge

```

Start your Docker environment:

```bash
# From the project root
docker-compose up
```

With `EXTENSIONS_AUTO_RELOAD` enabled in your Directus config, your changes will be automatically detected and reloaded during development.

You can now access:

- The Directus admin panel at `http://localhost:8088/admin`.
- The Inngest endpoint at `http://localhost:8088/inngest`.
- The Inngest Dev Server UI at `http://localhost:8288`.

The Inngest Dev Server provides a powerful interface for debugging your functions, viewing execution traces, and replaying events during development.

### Create the Extension Bundle

From your project root, initialize a bundle extension that will contain both an endpoint (for handling Inngest functions) and a hook (for triggering events):

```bash
# Create the extension directory
mkdir queue
cd queue

# Initialize npm/package.json
npx create-directus-extension@latest
```

When prompted, select the following options:

```
? Choose the extension type: bundle
? Choose a name for the extension: queue
? Choose the language to use: typescript
? Auto install dependencies?: Yes
```

### Configure the Extension Bundle

Set up your bundle extension by updating the `package.json` file to include both an endpoint and a hook:

```json
// queue/package.json
{
	//...rest of file
  "directus:extension": {
    "type": "bundle",
    "path": {
      "app": "dist/app.js",
      "api": "dist/api.js"
    },
    "entries": [
      {
        "type": "endpoint",
        "name": "inngest",
        "source": "src/inngest/index.ts"
      },
      {
        "type": "hook",
        "name": "hooks",
        "source": "src/hooks/index.ts"
      }
    ],
    "host": "^10.0.0 || ^11.0.0"
  }
}

```

Install Inngest and any other dependencies:

```bash
cd queue
npm install inngest express
```

### Set Up the Project Structure

Create the necessary directories and files for the implementation:

```bash
mkdir -p src/inngest src/functions src/hooks src/utils
```

The final structure should look like this:

```
queue/
├── src/
│   ├── functions/  # Inngest workflow implementations
│   ├── hooks/      # Directus event hooks
│   ├── inngest/    # Inngest client and types
│   └── utils/      # Shared utilities
├── package.json
└── tsconfig.json
```

### Implement Inngest Types and Client

First, create some types for the Directus context in `src/inngest/types.ts`:

```tsx
// src/inngest/types.ts
import type { Accountability, Item, PrimaryKey, Query, SchemaOverview } from '@directus/types';
import type { Knex } from 'knex';
import type { EventEmitter } from 'node:events';
import type { Logger } from 'pino';

export interface AbstractService {
  knex: Knex;
  accountability: Accountability | null | undefined;

  createOne: (data: Partial<Item>) => Promise<PrimaryKey>;
  createMany: (data: Partial<Item>[]) => Promise<PrimaryKey[]>;

  readOne: (key: PrimaryKey, query?: Query) => Promise<Item>;
  readMany: (keys: PrimaryKey[], query?: Query) => Promise<Item[]>;
  readByQuery: (query: Query) => Promise<Item[]>;

  updateOne: (key: PrimaryKey, data: Partial<Item>) => Promise<PrimaryKey>;
  updateMany: (keys: PrimaryKey[], data: Partial<Item>) => Promise<PrimaryKey[]>;

  deleteOne: (key: PrimaryKey) => Promise<PrimaryKey>;
  deleteMany: (keys: PrimaryKey[]) => Promise<PrimaryKey[]>;
}

export interface DirectusServices {
  [key: string]: AbstractService;
}

export interface DirectusContext {
  services: DirectusServices;
  database: Knex;
  getSchema: () => Promise<SchemaOverview>;
  env: Record<string, any>;
  logger: Logger;
  emitter: EventEmitter;
}

```

Next, create the Inngest client in `src/inngest/client.ts` . The Inngest client is used to create and invoke your functions securely.

```tsx
// src/inngest/client.ts
import type { DirectusContext } from './types';
import { Inngest, InngestMiddleware } from 'inngest';

interface InngestContext {
  directus: DirectusContext;
}

let directusContext: DirectusContext | null = null;
let inngestClient: Inngest<InngestContext & { id: string }> | null = null;

export function setDirectusContext(context: DirectusContext): void {
  directusContext = context;
}

function createInngestClient(): Inngest<InngestContext & { id: string }> {
  const contextMiddleware = new InngestMiddleware({
    name: 'Directus Context Middleware',
    init: () => ({
      onFunctionRun: () => ({
        transformInput: ({ ctx }) => ({
          ctx: {
            ...ctx,
            directus: directusContext,
          },
        }),
      }),
    }),
  });

  return new Inngest<InngestContext & { id: string }>({
    id: 'directus-inngest',
    isDev: true,
    middleware: [contextMiddleware],
  });
}

function getInngestClient(): Inngest<InngestContext & { id: string }> {
  if (!inngestClient) {
    inngestClient = createInngestClient();
  }

  return inngestClient;
}

export const inngest = getInngestClient();
```

Here's a breakdown of this code implementation:

The client setup involves several key components:

- **Context Management:** The code maintains a singleton pattern for both the Directus context and Inngest client, ensuring consistent access throughout the application.
- **Type Safety:** TypeScript interfaces (InngestContext) ensure type safety when passing the Directus context through Inngest functions.
- **Middleware Integration:** A custom middleware is implemented to inject the Directus context into every Inngest function execution, making Directus services and utilities available within your workflows.
- **Development Mode:** The client is configured with isDev: true, enabling detailed logging and debugging capabilities during development.

The `setDirectusContext` function is particularly important as it allows initialization of the context when the endpoint first loads, making it available to all subsequent function executions.

### Create the Inngest Endpoint

Now, implement the endpoint that will serve your Inngest functions. This endpoint creates a bridge between Directus and Inngest. It's also helpful to check out their docs for more info about using [Inngest in an Express app](https://www.inngest.com/docs/getting-started/nodejs-quick-start).

```tsx
// src/inngest/index.ts
import type { Router } from 'express';
import type { DirectusContext } from './types';

import { defineEndpoint } from '@directus/extensions-sdk';
import { serve } from 'inngest/express';

import { inngest, setDirectusContext } from './client';

export default defineEndpoint({
  id: 'inngest',

  handler: (router: Router, context: DirectusContext) => {
    setDirectusContext(context);

    const handler = serve({
      client: inngest,
      // Notice we don't have any functions yet
      functions: [],
    });

    router.use(
      '/',
      handler,
    );
  },
});
```

Here's a breakdown of this endpoint implementation:

- **Context Management:** The handler receives both the Express router and Directus context. The context is stored using setDirectusContext() to make it available to all Inngest functions.
- **Inngest Server Setup:** The serve() function from Inngest creates an Express-compatible handler that will manage function execution, retries, and event processing.
- **Function Registration:** The empty functions array will later be populated with the workflow implementations, allowing for clean separation of concerns.
- **Router Configuration:** The endpoint is mounted at the root path of the extension's URL, making it accessible at `/inngest` in your Directus installation.

### Implement Directus Hooks

Next, create hooks to trigger Inngest functions when certain events occur in Directus:

```tsx
// src/hooks/index.ts
import type { EventContext } from '@directus/types';
import { defineHook } from '@directus/extensions-sdk';
import { inngest } from '../inngest/client';

export default defineHook(({ action }) => {
  action('files.upload', (event, context: EventContext) => {
    if (event.collection === 'directus_files' && event.payload.type.startsWith('image/')) {
      inngest.send({
        name: 'image-uploaded',
        data: {
          event,
          accountability: context.accountability,
        },
      });
    }
  });
});

```

Here's an examination of this hooks implementation in detail:

- **Hook Definition:** Using `defineHook`, we create a Directus hook that listens for file upload events specifically.
- **Event Filtering:** The code checks two conditions:
    - Ensures the collection is 'directus_files'.
    - Verifies the uploaded file is an image (checking MIME type).
- **Event Emission:** When conditions are met, it triggers an Inngest event named 'image-uploaded'.
- **Data Passing:** The event payload includes:
    - The original Directus event data.
    - User accountability context for permission handling.

### Implement Workflow Functions

Now, create a simple workflow function to consume the `image-uploaded` event.

By default, [asset transformations](https://directus.io/docs/guides/files/transform#preset-transformations) in Directus on created "on the fly" (and then cached) whenever you request an image, but if you're statically generating a large site with lots of images this can slow your build time.

You can address that by using Inngest to do the transformations when images are uploaded, instead of when they are requested.

```tsx
// src/functions/pregenerate-image-transforms.ts
import type { DirectusContext } from '../inngest/types';
import { inngest } from '../inngest/client';

export default inngest.createFunction(
  {
    id: 'pregenerate-image-transforms',
    name: 'Pre-generate images in different sizes',
    description: 'This flow will generate image transforms in the preset sizes whenever an asset is uploaded.',
    concurrency: 1,
  },
  { event: 'image-uploaded' },
  async ({ event, step, directus }) => {
    const { services, getSchema } = directus as DirectusContext;
    const { AssetsService, SettingsService } = services;

    const schema = await getSchema();

    // The assets service is used to get the assets and apply the image transforms
    const assetsService = new AssetsService({
      schema,
      accountability: event.data.accountability,
    });

    // The settings service is used to get the preset image transforms
    const settingsService = new SettingsService({
      schema,
      accountability: event.data.accountability,
    });

    // Get the presets from the Directus project settings
    const presets = await step.run('get-settings', async () => {
      const settings = await settingsService.readSingleton({});
      return settings.storage_asset_presets;
    });

    for (const preset of presets) {
      await step.run(`get-assets-${preset.key}`, async () => {
        // Loop through each preset
        const asset = await assetsService.getAsset(event.data.event.key, {
          transformationParams: preset,
        });

        return asset;
      });
    }

    return { success: true };
  },
);

```

Here's a breakdown of this image transformation function in detail:

- **Function Configuration:** The function is set up with a specific ID, name, and description. The concurrency limit of 1 ensures sequential processing of images and keeps memory usage to a minimum.
- **Event Trigger:** It listens for the 'image-uploaded' event configured in the hooks.
- **Service Initialization:** Two crucial Directus services are instantiated:
    - AssetsService: Handles image transformations and asset management.
    - SettingsService: Retrieves project-wide settings including transformation presets.
- **Step-by-Step Processing:** The function uses Inngest's step.run() for each operation:
    - First step fetches transformation presets from Directus settings.
    - Subsequent steps apply each preset to the uploaded image.
- **Error Handling:** The step.run() approach provides automatic retry capabilities and detailed logging for each transformation operation.

This implementation ensures that all preset transformations are generated immediately upon upload, improving performance for subsequent image requests. The step-based approach also provides better observability and reliability compared to processing everything in a single operation.

### Building Your Extension

In your development environment, you'll likely use the `dev` command.

```bash
cd queue
npm run dev
```

When you're ready for production, use the `build` command.

```bash
npm run build
```

---

## Real-World Workflow Applications

Now that the infrastructure is set up, consider these other practical applications:

![Inngest Translation Screenshot](/img/inngest-translation-screenshot.png)

### Content Translation and Localization

A powerful AI workflow is automatic content translation:

1. When a post is created or updated, the event triggers a workflow.
2. The workflow can detect which fields changed.
3. It translates the content into multiple configured languages.
4. The translations are stored in a separate collection.
5. Users immediately see their content available in all languages.

Here's the general flow for content translation:

1. Configure supported languages in Directus.
2. When content is created/updated, the hook sends an event to Inngest.
3. The Inngest function fetches the content and translations.
4. Changed fields are translated using an LLM or something like the DeepL API.
5. Translations are saved back to Directus.

This approach handles multiple fields, content types, and languages seamlessly.

### Other AI Workflow Possibilities

The Directus + Inngest + AI combination opens up numerous opportunities:

**Content Analysis**

- Analyze blog posts for sentiment, topics, and keywords.
- Generate SEO metadata automatically.
- Extract entities from text content.

**Content Moderation**

- Analyze user-generated content for policy violations.
- Filter inappropriate images or text.
- Flag content requiring human review.

**Personalization Engines**

- Analyze user behavior and preferences.
- Generate personalized content recommendations.
- Dynamically adjust content based on user segments.

**Data Enrichment**

- Extract entities and relationships from unstructured content.
- Automatically tag and categorize content.
- Generate related content suggestions.

## Conclusion

The combination of Directus and Inngest creates a powerful foundation for implementing sophisticated AI content workflows. This approach separates background processing from your core CMS, resulting in better performance, maintainability, and scalability.

Start by implementing simple workflows, then gradually expand with more advanced AI features as you grow comfortable with the setup. The modular nature of this architecture makes it easy to add new capabilities over time.

This guide provides the foundation for implementing AI workflows in your Directus projects. If you build something interesting with this approach, please share it in the [Discord community](https://directus.chat).
