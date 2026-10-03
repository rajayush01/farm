# Farmstead — Farm Management & Analytics (Frontend)

React + TypeScript + Tailwind frontend for the farm management platform spec:
poultry / layer / goat farms, batches, daily operations, feed, mortality,
weight, medicine, inventory, expenses, and analytics.

**This is frontend-only.** It runs entirely on mock, in-memory data out of
the box — no backend required to develop or demo the UI.

## Run it

```bash
npm install
npm run dev
```

## Connecting a real backend

Every data call in the app goes through `src/api/services/*.ts`. Each service
function has this shape:

```ts
async list(farmId: string) {
  if (USE_MOCK) {
    // reads from src/api/mockDb.ts
  }
  return httpClient.get(`/farms/${farmId}/batches`)
}
```

To switch from mock data to your real API:

1. Copy `.env.example` to `.env.local`.
2. Set:
   ```
   VITE_API_BASE_URL=https://your-api.com/api/v1
   VITE_USE_MOCK=false
   ```
3. That's it — no component code changes. Every page already calls the
   service layer, not the mock data directly, so once `USE_MOCK` is false
   every request goes to `httpClient`, which calls your real REST endpoints.

Match your backend's response shapes to the types in `src/types/index.ts`
(these mirror the entity list in the product spec — `Farm`, `Shed`, `Batch`,
`FeedPurchase`, `MortalityRecord`, `BatchMetrics`, etc.) and the app will work
unchanged. If your field names differ, the cleanest fix is to adjust the
`httpClient.get<T>()` call sites in each service file, not the pages.

### Auth

`src/api/httpClient.ts` reads a bearer token from `localStorage.getItem('auth_token')`
and attaches it to every request. Wire your login flow to store that token
there, or replace the `authHeaders()` function with your own scheme
(cookies, OAuth, etc.).

### Derived metrics (FCR, cost/bird, mortality %, ...)

Per the spec's API-first principle, these calculations should live on the
backend so web and mobile clients never disagree. `analyticsService.batchMetrics()`
computes them client-side only in mock mode; in real mode it simply calls
`GET /batches/:id/metrics` and expects your backend to return the `BatchMetrics`
shape from `src/types/index.ts`. Keep the calculation logic in one place
(the backend) and treat `computeBatchMetrics()` in
`src/api/services/analyticsService.ts` as a reference implementation only.

## Project structure

```
src/
  api/
    httpClient.ts        generic fetch wrapper — the only place to add auth/retries
    mockDb.ts             in-memory seed data
    services/              one file per domain area (farms, batches, feed, ...)
  types/index.ts          domain types mirroring the spec's entity list
  lib/
    config.ts              USE_MOCK / API_BASE_URL switch
    farmContext.tsx         current-farm selector, shared across pages
    format.ts               currency / date / weight formatting
  components/
    layout/                 Sidebar, Topbar, page shell
    ui/                     Card, StatCard, Badge, Button, form fields, states
  pages/                    one per nav item (Dashboard, Batches, Daily Entry, ...)
  hooks/useAsync.ts        tiny data-fetching hook (swap for React Query later)
```

## Design

Deliberately styled like a farm record ledger rather than a generic SaaS
dashboard: deep barn green + parchment + grain amber, Fraunces for headings
and big numbers, ruled ledger-style tables instead of nested cards.
