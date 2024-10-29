```typescript
import { createDirectus, rest, readItems } from "@directus/sdk";
const client = createDirectus("http://xyz/directus.io");

const item = await client.request(
	readItems("articles", {
		fields: ["id", "title", "date_published", "summary"]
	})
);
```
