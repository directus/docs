# Directus Docs — Domain Language

Shared vocabulary for this codebase. Seeded with rate-limiting terms; extend as other areas are sharpened.

## Language

### Rate limiting

**Burst limit**:
A short-window cap (seconds) on requests per identity, the cheap first gate against rapid-fire abuse.
_Avoid_: throttle, flood limit

**Daily limit**:
A per-UTC-day cap with multiple keyed dimensions (exact IP, IP prefix, fingerprint, IP+fingerprint combo) and degraded modes. The deep backstop; distinct from a burst limit.
_Avoid_: quota, cap

**Policy**:
What a caller declares to a limiter: `max`, `windowSeconds`, and `onStoreError`. The caller picks a policy; it never reimplements the algorithm.
_Avoid_: config, rule, options

**Store**:
The counting backend behind a limiter — `incr(key, ttlSeconds) -> count`. `MemoryStore` for local dev, `UpstashStore` for production (atomic, holds across serverless instances).
_Avoid_: backend, cache, KV (KV is one specific store)

**Verdict**:
The result of a limit check: `{ ok, retryAfter? }`. What the caller acts on.
_Avoid_: result, decision, response

**Fail closed / fail open**:
When the store errors, a `deny` policy fails closed (refuse the request); an `allow` policy fails open (let it through). Expensive/abusable endpoints deny; cheap public reads allow.

### Assistant

**Conversation history**:
The deep, framework-agnostic owner of persisted conversations (`useAssistantHistory`): localStorage sync, sorting, title derivation, compaction, and the `activeId`. Enforces the invariant that `activeId` points to an existing conversation — mutate it only through `setActive`/`clearActive`/`startNew`/`remove`, never by assigning the returned ref.
_Avoid_: conversation store, chat state

**Message transition**:
A change to the chat's message list — reset, open a saved conversation, delete the active one, or the easter egg. All transitions go through the single `setMessages(next)` writer in `useAssistant`, so the persistence watcher reasons about one mutation idiom. `useAssistant` is the Vue-reactive surface; it is not a separate session module.
_Avoid_: chat singleton, assistant session, set chat messages

## Relationships

- A caller passes a **policy** to a limiter and acts on the returned **verdict**.
- A limiter counts against a **store**; the store knows nothing about limits.
- **Burst limit** and **daily limit** are separate limiters. Burst is the cheap first gate; daily is the deep backstop.

## Example dialogue

> **Dev:** "If Upstash is down, does the burst limit block the assistant?"
> **Maintainer:** "Yes — the assistant burst **policy** is `onStoreError: 'deny'`, so it fails closed. The docs API **policy** is `'allow'`, so a store blip never takes down public docs search."

## Flagged ambiguities

- "rate limit" was used for both the burst and daily limiters. Resolved: they are distinct concepts — **burst limit** (short window, single key, process- or store-counted) vs **daily limit** (per-day, multi-key, degraded modes). Only the burst-style limiters share the `checkRateLimit` core.
