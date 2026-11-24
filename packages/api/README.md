# OpenAPI contracts and clients

`@oskar-lab/api` owns the HTTP infrastructure shared by independent apps. It does not belong in framework-independent `core`. The platform catalog, central account bridge, session lookup, registration form, Workout browser/server bridge, and Cloth Lab browser/worker bridge use `openapi-fetch` against generated types. Apps without HTTP APIs need no artificial network dependency. Auth.js still owns its OAuth, CSRF and session protocol; its SDK remains the supported login/logout interface.

## Regeneration

1. In `backend`, run `./gradlew test --tests '*OpenApiTests' --rerun-tasks`. The integration test starts an isolated H2 database and exports `build/openapi/backend.json`; it does not use production accounts or a running database.
2. In `frontend`, run `npm run api:sync` to copy and normalize that backend export, derive the browser Workout paths and regenerate TypeScript.
3. For worker changes, run `python export_openapi.py` in `ai-worker`, then `npm run api:generate` in `frontend`.
4. Run `npm run check`. `npm run api:check` fails when generated artifacts differ from the checked-in contracts. `node scripts/generate-api.mjs --sync --check` also compares with a fresh backend export. Commit contracts and generated types together with their source changes.

`openapi/backend.json` and `openapi/worker.json` are snapshots of the respective servers. `openapi/browser-base.json` describes the Next.js-owned session, registration and try-on proxy endpoints. `openapi/browser.json` additionally derives Workout operations from the backend contract, removes trusted identity headers, and describes browser cookie authentication. Browser paths are relative to the owning app's base URL, not a combined deployment server. Do not hand-edit `src/generated`.

## Travel backend contract

The generated backend types include `/internal/travel/trips` and its entries, viewers and
attachment endpoints. Use `createBackendClient` only from authenticated server code, with
`X-User-Id` derived from the platform session and `X-Auth-Bridge` from server configuration.
Never let browser JSON/headers choose the acting user or include the secret in browser code.
The owner is the authenticated account; sharing email addresses grant read-only access only
after central auth has proved their ownership. Existing accounts must sign in through Google
again after the backend upgrade to establish this proof; password-only signup is insufficient.

Entries contain typed points with local dates, nullable times, zone/offset and explicit
time-window semantics. Keep parent entry IDs while flattening points for a timeline. The
trip/entry version returned by GET is required for updates; handle 409 by reloading rather
than silently overwriting. All lists must respect pagination. Multipart uploads use the
existing `multipartBody`; PDF/PNG/JPEG are limited to 5 MiB. Downloads are binary and should
use `parseAs: "blob"`, never JSON conversion. Runtime backend validation and access checks
remain authoritative; generated TypeScript is not a runtime validator.

Travel has no browser-facing adapter in this change, so its private paths are deliberately
absent from `BrowserPaths`. The current Thailand UI remains on its legacy JSON source until
explicitly migrated. No private booking content is embedded in the schema snapshots. See
the backend's `docs/travel-api.md` for complete payloads, limits and storage/privacy details.

```ts
import {createBrowserClient} from "@oskar-lab/api/client";

const api = createBrowserClient(`${window.location.origin}/apps/workout`);
const result = await api.GET("/api/workout/plans", {
    params: {query: {page: 0}},
    signal: AbortSignal.timeout(15000),
});
```

Generated types provide compile-time checks, not runtime validation. Keep the existing identity, plan, tracking, catalog and upload validators at untrusted boundaries. Use explicit timeouts per operation, retry only safe reads, and preserve status codes for translated UI errors. Multipart requests use `multipartBody`, letting fetch set its boundary. Worker image responses are streamed without JSON conversion. Core & Design discovers the public client functions automatically, excluding generated type internals.

## Security, privacy and dependencies

The typed clients themselves add no tracking or browser permissions. Durable app files now use the existing OrbitStorage service and Hetzner Object Storage; the backend storage documentation and central privacy notice describe those data flows. Requests still go to the configured platform/backend or self-hosted image worker. Existing identity and image data, retention and deletion behavior remain unchanged. Bridge credentials are read only in server modules and are never included in browser client configuration. Schema snapshots contain shapes, not real accounts, cookies, tokens or images. Swagger UI assets are bundled by the backend; its remote validator is disabled and authorization is not persisted.

`openapi-fetch` and `openapi-typescript` use the MIT license; springdoc and Swagger UI use Apache-2.0. Their package license notices remain in the installed distributions. No new branding or visual assets are introduced.

The storage-proxy rollout on 2026-11-24 updates Next.js and eslint-config-next to 16.4.6,
with compatible dependency fixes. The resulting npm audit reported zero known findings.
This replaces the earlier unresolved Next.js/image dependency findings; it is not an assurance
that the Java/Python stacks or future advisories are vulnerability-free. Relevant upstream
advisories: [SVG image optimization](https://github.com/advisories/GHSA-2464-fhr4-w9xw) and
[self-hosted response forwarding](https://github.com/advisories/GHSA-pc58-hwjq-p385).

## Local Windows test environment

If Java 21 reports `Unable to establish loopback connection` in `UnixDomainSockets`, the local test run can use a nonexistent Unix-domain socket directory to trigger Java's TCP fallback:

```powershell
$env:JAVA_TOOL_OPTIONS='-Djdk.net.unixdomain.tmpdir=D:\Projects\WebDev\Oskar-Lab\backend\build\nonexistent-socket-directory'
```

This is a process-local workaround, not a required production setting.

## Verification

The integration was checked with 164 frontend tests, TypeScript, ESLint, all ten
production app builds, 21 backend tests and the Gradle build, plus four worker
tests using the mock image engine. Browser checks covered Swagger UI, discovery
of the new API helpers in Core & Design, the account screen, mobile Workout
templates and detail navigation, recovery via Retry after restoring the backend,
and Cloth Lab's offline-worker state. No real Google sign-in, persistent personal
account, or GPU image generation was exercised. Binary upload handling is covered
by the shared client and worker tests.

The sibling `ai-worker` folder currently has no Git repository. Its updated
`app/main.py`, `export_openapi.py` and `tests/test_worker.py` must be included when
archiving or deploying the worker; the generated worker contract is versioned in
this frontend repository.
