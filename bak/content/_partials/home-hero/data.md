```typescript
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('http://directus.example.com');

const item = await directus.request(
	readItems('articles', {
		fields: ['id', 'title', 'date_published', 'summary'],
		filter: { status: { _eq: 'published' } },
		sort: ['-date_published'],
		limit: 3
	})
);
```