# Oskar Lab production

Production URL: https://oskarlab.dev. Server: `167.235.153.117`.
The frontend repository owns orchestration; each repository owns its image and
GitHub Actions workflow. A push to `main` deploys when `DEPLOY_ENABLED=true`.
Manual runs use Actions → Deploy Oskar Lab → Run workflow. Images are tagged with
the exact commit SHA and transferred over pinned SSH; no registry token is needed.

## Isolation and layout

`/opt/oskar-lab` contains root-owned `compose.yml`, `production.env` (0600),
`images.env`, `bin/`, `backups/` and `releases/`. The Compose project is always
`oskar-lab-production`. Its Postgres 16 instance has its own network, credentials
and `oskar-lab-production_postgres-data` volume. No database or backend port is
published. The platform is available on loopback port 10030 for diagnostics.

Only the platform joins `oskar-lab-edge`. The existing Caddy ingress joins this
network and routes `oskarlab.dev` to `oskar-lab-platform:3000`. Lilsi's services,
database and volumes remain separate. Ports 80/443 and the physical host are
shared; this is application isolation, not a separate VM. Resource limits and
off-server builds keep resource usage bounded. Never run global Docker prune or
`down -v` as part of deployment. Caddy updates must preserve both projects' routes.

Seven independent Next.js processes use one tested workspace image. Shared source
and TypeScript are included because Core & Design generates source documentation
at runtime. All build contexts exclude local environment files and credentials.
ClothLab's GPU inference worker is intentionally not installed on this 4 GB CPU
server; configure a separate `TRYON_WORKER_URL` when available.

## GitHub configuration

Both repositories use a `production` environment, repository variables
`DEPLOY_ENABLED=true`, `DEPLOY_HOST=167.235.153.117`, and environment secrets
`DEPLOY_SSH_KEY` and `DEPLOY_KNOWN_HOSTS`. The frontend also needs
`PUBLIC_URL=https://oskarlab.dev` as a repository variable (build-time routing).
The dedicated SSH user `oskar-lab-ci` has no Docker-group access. Its forced
command accepts only `deploy frontend|backend <40-character SHA>` and invokes the
root-owned deployment script through a narrow sudo rule. Deployment credentials
authorize application releases; protect `main` and access to Actions accordingly.
The personal root SSH key is never copied to GitHub.

Workflow changes apply on push. Changes under `deploy/` require explicitly copying
the reviewed files into `/opt/oskar-lab`; workflows cannot overwrite their own
privileged deployment script. Keep installed files and this directory in sync.

## Updates and migrations

The Docker builds run frontend type checks, ESLint, tests and all seven production
builds, or backend tests and the production jar build. The deployment command
serializes both repositories with a server-side lock, loads the image, saves a
compressed Postgres dump before backend updates, and waits for healthy services.
Start backend first on a fresh server, then frontend. The frontend update starts
the platform followed by each product to bound simultaneous startup load.

Flyway runs pending migrations on backend startup; production disables automatic
baselining. Never edit applied migrations. Existing local accounts/logs are not
automatically copied to production. A failed deployment exits with an error and
does not mark the candidate image as the successful release. Inspect container
state: a partially updated release may still be running. Fix forward, or restore
a compatible image after reviewing schema compatibility. There is no automatic
database downgrade. The previous image references are retained in `releases/`.

```sh
cd /opt/oskar-lab
docker compose --env-file production.env --env-file images.env -f compose.yml ps
docker compose --env-file production.env --env-file images.env -f compose.yml logs --tail 100 backend
```

Backups are local pre-migration recovery points, not disaster recovery. Copy them
to independent storage and test restoration before relying on them. Images and
backups are retained; periodically review disk usage and remove only identified,
unused Oskar Lab artifacts. Deployment never deletes shared Docker resources.

## Domain and login

Set Cloudflare DNS `A @ → 167.235.153.117`, initially DNS-only. Caddy obtains TLS
once DNS points here. Do not add an AAAA record without verifying the exact host
IPv6 address; the provided /64 is a network prefix, not a host address.
If enabling Cloudflare proxying later, use Full (strict) TLS.

Credentials login works immediately. Google login is optional: configure a web
OAuth client with redirect URI `https://oskarlab.dev/api/auth/callback/google`,
then set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in the server-only env file and
recreate only `platform`. `AUTH_SECRET`, `AUTH_BRIDGE_SECRET` and database password
are independently generated production credentials. Never commit this file.
