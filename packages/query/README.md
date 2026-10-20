# Shared server-state caching

`@oskar-lab/query` supplies TanStack Query v5 defaults for the platform and apps
that use HTTP data. It is infrastructure, independent of React UI design and
project domain models. OpenAPI clients still own transport and runtime validators
still check untrusted payloads.

Enable `<AppDocument enableQueries>` in an app layout. This mounts the provider
inside Auth.js and replaces its cache when the account ID changes. Each mount
creates a separate client; there is no server-wide or cross-app singleton.
Local-only apps do not enable it. Auth.js keeps ownership of session refresh,
login, registration and logout; passwords and session credentials do not enter
TanStack caches.

Queries normally stay fresh for 30 seconds and unused data is removed after five
minutes. Public catalogs can specify longer freshness. Resume, focus, pageshow
and reconnection events are coalesced before refreshing active stale queries.
Disabled editing queries are skipped. Reads retry temporary failures twice, with
500/1500 ms delays; 4xx rejections and cancellation are not retried. Forward the
query's AbortSignal to the OpenAPI request. Offline reads resume on reconnection.

Mutations never retry automatically and use `networkMode: "always"` so offline
writes fail visibly instead of entering an implicit queue. They have no inactive
cache retention. Workout preserves the existing pending log ID for deliberate
user retries; the server remains responsible for idempotency, permissions and
version conflicts. Account changes abort pending app requests. Aborting a request
cannot undo a write already accepted by the server.

## Consumers

- Platform: server-rendered public catalog seeds the browser query; `/api/apps`
  provides same-origin recovery. Local app cards remain usable during failures.
- Workout: shared catalog/templates, account-keyed infinite plans/history,
  individual plan queries, and explicit save mutations. Drafts remain React or
  existing session-storage state, separate from server data. Plan editing disables
  personal refresh; historical data can refresh without replacing set inputs.
- Cloth Lab: visible-page worker polling and single-attempt generation mutations.
  Uploads are aborted on unmount, results are reset out of mutation state, and
  image object URLs are revoked. No generated image is stored in a query cache.
- Core & Design automatically documents the shared provider and utilities. The
  provider has no visible UI and therefore no visual component preview.

## Data flows and dependency review

The new cache is memory-only: public catalog entries, plans, exercise histories
and worker availability serve the same UI and use the same configured backend
and worker as before. No new data recipients, storage permissions, analytics,
remote assets or third-party runtime services are introduced. Personal query keys
include the account ID; provider disposal clears cached queries and mutations.
Existing workout draft persistence and user-controlled image lifetime remain
unchanged. Do not add cache persistence or cross-tab broadcasting without a new
privacy review. Do not hydrate private server data into a shared cache.

`@tanstack/react-query` and `@tanstack/query-core` are MIT licensed; installed
packages retain their notices. The integration adds no new branding or assets.
Installation still reports the previously documented eight audit findings in the
existing dependency tree, including the critical Next.js finding; see
`../api/README.md`. Those require a separate dependency update before release.

Run `npm run check` from the frontend workspace. Package tests cover retry policy,
scope isolation, request cancellation, disabled editing queries, mutation behavior
and resume events. App tests cover query reuse, pagination and endpoint failures.

The integration was verified with the full workspace TypeScript/lint/build checks
and 180 frontend tests. Browser checks used synthetic accounts in an isolated H2
database: plan creation, list invalidation, mobile set recording/history refresh,
and cross-tab sign-out/sign-in while the original Workout page remained mounted.
The second account never displayed the first account's plans. The platform's local
catalog fallback, Cloth Lab's offline worker indicator, and automatic Core & Design
discovery were also checked. GPU generation and a real Google login were not tested.
