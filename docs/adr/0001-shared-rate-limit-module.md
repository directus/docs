# ADR-0001: One shared RateLimit module with a pluggable store

- Status: Accepted
- Date: 2026-05-31

## Context

Three near-identical fixed-window rate limiters existed independently:

- `server/utils/docs-api-rate-limit.ts` — in-memory, swept, hardcoded 60/min.
- `server/utils/mcp-rate-limit.ts` — in-memory, **no sweep** (Map grew unbounded), parameterized.
- A burst `checkRateLimit` inside `modules/assistant/runtime/server/utils/rate-limit.ts` — in-memory, swept, parameterized.

The same file also held `checkAssistantDailyLimits`, a deeper limiter backed by Upstash/Vercel KV using atomic `INCR` + `EXPIRE`. So the codebase told two stories: daily limits counted against a store; burst limits mutated a process-local `Map`.

Two problems followed:

1. **The burst path was wrong on Vercel.** Serverless runs many instances, each with its own `Map`. A "10 per window" limit was really "10 × N instances." Daily limits had already moved to KV for exactly this reason; burst never did.
2. **The MCP limiter leaked memory** — it never evicted expired buckets.

## Decision

Collapse the three burst-style limiters into one module, `server/utils/rate-limit.ts`, with:

- A single `checkRateLimit(key, policy, override?)` core. **Async**, because correct counting requires an atomic increment against a store.
- A `RateLimitStore` seam — `incr(key, ttlSeconds) -> count` — with two adapters: `MemoryStore` (swept, for local dev) and `UpstashStore` (atomic `INCR`+`EXPIRE`, holds across instances). This matches the store-backed counting pattern the daily path already uses, while keeping daily's multi-key logic separate.
- Failure mode as a per-policy field, `onStoreError: 'deny' | 'allow'`. The caller declares its own risk tolerance:
  - Assistant burst and MCP code search → `deny` (expensive, abusable; if we can't count, we refuse).
  - Public docs API → `allow` (cheap read-only; an Upstash blip must not take down docs search).

`checkAssistantDailyLimits` stays a separate, deep module (multi-key, degraded modes, overrides, fail-closed). It is unchanged and may reuse `RateLimitStore` internally later.

## Consequences

- **Burst limits now hold across Vercel instances.** This is a behavior change, not just a refactor — the previous per-instance counting was a latent production bug.
- The MCP memory leak is gone structurally: there is one memory implementation, and it sweeps.
- `checkRateLimit` is now `async`; all call sites already awaited inside async handlers.
- The interface is the test surface: inject a fake `RateLimitStore` to test window/verdict/failure-mode logic with no network and no clock mocking.

## Do not re-litigate

Do **not** "simplify" the burst path back to a process-local `Map`. It looks like dead weight in single-instance local dev, but the in-memory version is incorrect under the multi-instance serverless deployment this ships to. The store seam is load-bearing, not speculative — two real adapters exist.
