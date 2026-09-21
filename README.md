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
