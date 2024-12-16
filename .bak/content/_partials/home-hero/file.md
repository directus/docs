```typescript
import { createDirectus, rest, readAssetRaw } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
  readAssetRaw('file_id', {
    transforms: [['blur', 10], ['tint', 'rgb(102, 68, 255)']],
    fit: 'cover',
    width: 300,
    height: 100,
  }),
);
```
