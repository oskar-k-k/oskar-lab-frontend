# Oskar Lab app workspace

This npm workspace contains independent Next.js applications. There are no imports between sibling apps. The Spring Boot backend and Python worker remain sibling directories with their existing Git histories.

## Layout

```text
apps/
  oskar-lab/       Platform catalog and central authentication
  chess/          Chess UI and domain model
  cloth-lab/      Try-on UI and worker proxy
  neon-vault/     Casino demo
  portfolio/     Personal portfolio
  core-design/   Live package documentation and previews
packages/
  core/           Framework-independent classes
  ui/             Components and CSS tokens
  i18n/           Typed English/German translations and locale context
  auth/           Shared authentication integration
  platform-shell/ Optional platform header and document defaults
  config/         App routing and local service configuration
scripts/
  dev.mjs         Starts selected or all app development servers
```

## Start the platform and all apps

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:10030 (or http://127.0.0.1:10030). The platform proxies each `/apps/<slug>` URL to its independent app server. Cross-app links intentionally perform full navigation so JavaScript and styles cannot leak between applications.

| App / service | Port | Platform URL |
| --- | --- | --- |
| Oskar Lab | 10030 | / |
| Chess | 10031 | /apps/chess |
| ClothLab | 10032 | /apps/cloth-lab |
| Neon Vault | 10033 | /apps/neon-vault |
| Portfolio | 10034 | /apps/portfolio |
| Core & Design | 10035 | /apps/core-design |
| Spring Boot | 10081 | API /apps |
| PostgreSQL | 10054 | Container port 5432 |
| Try-on worker | 10078 | /health, /try-on |

Port 10080 is avoided because Fetch blocks it. Start PostgreSQL and the backend using `../backend/README.md`, and the worker using `../ai-worker/README.md`.

Old `/projects/<slug>` links redirect to `/apps/<slug>`, with `/projects/core` mapped to `/apps/core-design`. Catalog artwork lives in the platform's `public/catalog` directory.

## Run or build an individual app

```powershell
npm.cmd run dev:app -- chess
npm.cmd run build --workspace=@oskar-lab/chess
npm.cmd run start --workspace=@oskar-lab/chess
```

The default app build is mounted under `/apps/chess`, including its assets. Its direct URL is http://localhost:10031/apps/chess. You can run it without the platform server; the platform header is optional. For navigation back to the platform from a direct app origin, set `NEXT_PUBLIC_PLATFORM_URL=http://localhost:10030`.

For a product at its own origin root, without platform navigation or account requests:

```powershell
npm.cmd run dev:app -- cloth-lab --standalone
```

Open http://localhost:10032. Stop its integrated development instance first because both modes use the same port. Standalone mode uses a separate `.next-standalone` output directory.
For production standalone builds, set `APP_STANDALONE=true` and `NEXT_PUBLIC_PLATFORM_SHELL=standalone` for both the build and start commands. Base paths and public settings are build-time configuration.

## Configuration and shared login

Environment files belong to each app, not the workspace root. Copy the app's `.env.example` to `.env.local` without overwriting existing credentials.

- Platform: `NEXT_PUBLIC_API_URL` defaults to http://localhost:10081.
- ClothLab: `TRYON_WORKER_URL=http://localhost:10078/try-on`.
- Platform routing: override `APP_CHESS_URL`, `APP_CLOTH_LAB_URL`, `APP_NEON_VAULT_URL`, `APP_PORTFOLIO_URL`, or `APP_CORE_DESIGN_URL` for deployment.
- Shared header: configure `NEXT_PUBLIC_PLATFORM_URL` (defaults to the current origin), or disable it with `NEXT_PUBLIC_PLATFORM_SHELL=standalone`.
- Direct integrated app origins forward `/api/auth/*` to `AUTH_PLATFORM_URL` (default http://127.0.0.1:10030). Using the single platform origin is the supported shared-login entry point.
- Google credentials and `AUTH_SECRET` belong only to `apps/oskar-lab/.env.local`. Register `http://localhost:10030/api/auth/callback/google` in the Google OAuth client.

Independent deployments on unrelated domains require a deliberate SSO/session design; sharing the package does not share browser cookies automatically. No new user database or identity migration is introduced here.

## Checks

```powershell
npm.cmd run check
```

This checks types in every app, lints the workspace, runs app/package tests and builds each app independently. Core & Design reads source documentation from `packages/core`, `packages/ui`, and `packages/platform-shell`.

Keep domain logic in its owning app. Shared packages must not import app source. Each product owns its root layout and can replace shared document defaults or the platform header later. The translation catalog remains shared for now; extracting an app also requires its relevant translations and package dependencies.

## Platform accounts

`/account` is the central login and registration page. Guests can use public apps without registering. Local registration requires a unique username (3–32 uppercase/lowercase ASCII letters, digits or underscores; displayed as entered, unique irrespective of case), email, a password of 12–128 characters, matching confirmation, and explicit acceptance of the versioned terms. Login accepts username or email, case-insensitively.

Google identities must have a verified email. First-time Google users choose their username and accept the terms before account-dependent features can use their identity. When a Google email matches an existing local account, the user confirms the existing password once. This prevents account pre-hijacking through unverified local email addresses. Both login methods then resolve to the same internal UUID. Google subjects, not changeable email addresses, identify already linked accounts.

### Local configuration

In `apps/oskar-lab/.env.local`:

```dotenv
AUTH_SECRET=<random secret, at least 32 characters>
AUTH_BRIDGE_SECRET=<different random secret, at least 32 characters>
AUTH_BACKEND_URL=http://127.0.0.1:10081
AUTH_URL=http://localhost:10030
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=<Google OAuth web client ID>
AUTH_GOOGLE_SECRET=<Google OAuth web client secret>
```

Put the **same bridge secret** in `../backend/.env.local`. Never put either secret in a `NEXT_PUBLIC_*` variable. The backend accepts identity operations only through this server-to-server credential. Google credentials belong only to the platform. Restart the platform after updating them.

In Google Cloud, configure the web client's authorized redirect URI exactly as:

```text
http://localhost:10030/api/auth/callback/google
```

Use `localhost:10030` consistently for local login. With this AUTH_URL, the platform redirects requests from `127.0.0.1` to `localhost` before authentication so OAuth state and session cookies stay on one host. Production requires the real HTTPS origin, unique secrets, and a trusted reverse proxy that rejects untrusted Host headers. Do not expose the private backend authentication routes through a public reverse proxy.

Start the built backend using `./start-local.ps1` in the backend directory. Start all frontends with `npm run dev`. For individual apps, `AUTH_PLATFORM_URL` identifies the central account service. Apps redirect account pages to that service and proxy session requests; they never need Google credentials.

### Checking identity in apps

```tsx
// Client component: presentation only, never an authorization boundary.
import {useCurrentUser} from '@oskar-lab/auth/useCurrentUser';
const {user, loading, needsOnboarding} = useCurrentUser();
```

```ts
// Server Component or route: verifies the incoming cookie with the central service.
import {getCurrentUser, requireCurrentUser} from '@oskar-lab/auth/platformUser';
const optionalUser = await getCurrentUser(); // null for guests / unfinished onboarding
const user = await requireCurrentUser();    // throws without a completed account
// Use user.id for ownership checks; never trust an ID submitted by the client.
```

Server helpers fail closed on account-service outages. Keep public pages independent of those helpers. The shared provider remains available even when the platform header is hidden. Integrated apps share the browser origin; unrelated production domains need a dedicated SSO flow, not cross-domain cookie copying.

Auth.js stores the opaque backend credential only inside its encrypted HTTP-only session cookie, never in the public session JSON. The backend stores its SHA-256 digest, validates it on session reads, expires it after seven days and revokes it on logout. Passwords use salted PBKDF2-HMAC-SHA256 with 600,000 iterations. Login and registration have backend rate limits. The current limiter is in-process; multi-instance production deployments need a shared limiter and edge/IP limits. Schedule removal of expired database sessions as operational maintenance.

### Terms and release requirements

`/terms` contains a bilingual development draft; `/privacy` explains the account data and essential session cookie. Acceptance time and terms version are persisted. Keep `TERMS_VERSION` in the shared auth contract and `AccountService.TERMS_VERSION` synchronized when publishing updated terms. Existing accounts are not silently recorded as having accepted a new version.

Before public release, supply the operator/contact details and complete and review the privacy notice. The draft leaves statutory liability intact; it is not a legal review. References: [BGB §307](https://www.gesetze-im-internet.de/bgb/__307.html), [BGB §309](https://www.gesetze-im-internet.de/bgb/__309.html), [DDG §5](https://www.gesetze-im-internet.de/ddg/__5.html).

Local email addresses are not yet verified by email, and there is no email delivery/password-reset flow. They are not proof of ownership; provider linking therefore requires the existing password. Google OAuth must be tested with real configured credentials before release. Never enable unconditional email-based account linking.
