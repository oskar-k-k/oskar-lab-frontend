# Private travel timeline

Independent Next.js app at `/apps/thailand` (port 10041 locally). Start via the workspace `dev.cmd start thailand` after checking `dev.cmd status`; the platform must also run for Google sessions. Sign in through the platform account page first. Anonymous, other-account and password-only sessions receive 404, including for each document and cover request. Platform discovery is filtered on the server. No public backend catalog entry is created.

`private-data/trip.json` holds dates, chronological events, document metadata and outstanding information. Documents live beside it. This folder is excluded from Git and Docker contexts. The checked-in application contains no booking data. Set `THAILAND_DATA_DIR` for a different server-only folder. Never put these files in `public` or embed them into client source. The app only serializes trip data after verifying the platform session; responses use private/no-store and noindex. There is no offline cache or analytics integration.

For production, securely transfer the local private-data files to `/opt/oskar-lab/private/thailand`, readable by container user 1000, and apply the updated compose/deployment definitions. Compose mounts only that directory read-only into the Thailand service. Build-time routing requires APP_THAILAND_URL (set in Dockerfile). The health endpoint contains no trip information. Deploy application code through the existing Oskar Lab pipeline. Do not commit private files or include them in the workspace image.

Content is a snapshot of confirmed travel emails, not a live airline feed. Missing hotels and unconfirmed transfers are explicitly identified. Plain-text confirmations are summaries, not boarding passes. New email content must be deliberately reviewed and imported; the app has no mailbox access.

## Missing production data

A Git push deploys application code, not the private files. If `trip.json` is missing or unreadable, authorized visitors see a recovery message instead of a server crash; denied identities still receive 404 before any file access. Document requests return an empty, private/no-store 503 when the trip index is unavailable. Unexpected programming errors still propagate.

The `/apps/thailand/health` readiness endpoint returns 503 until the mounted `trip.json` is readable by the application user. It never returns file contents, paths or error details. This prevents the deployment pipeline from marking a missing-data installation healthy. It checks readability only, not the completeness of bookings or documents.

Restore the original `trip.json` and referenced documents into `/opt/oskar-lab/private/thailand` using a secure transfer, with directory permissions 0700, file permissions 0600 and ownership UID/GID 1000. Preserve any existing files; do not create example bookings as a replacement. Verify the health endpoint, then open the timeline and a document using an authorized Google account. No authentication rules, data recipients, retention, analytics, third-party requests or asset licenses change in this fix.

Production diagnosis on 2026-11-24 confirmed `ENOENT` for the mounted trip index. The original private files were not present in this checkout. Restoring them is required before the real timeline can be considered operational.

## OrbitStorage cutover

Runtime file reads now go exclusively through the protected backend storage adapter.
`AUTH_BACKEND_URL` and the server-only `AUTH_BRIDGE_SECRET` are required. The app never
receives an OrbitStorage project/admin key. The existing Google-account guard runs before
requesting the index or documents; the backend additionally verifies the legacy allowlist
and centrally verified email proof. Existing users must sign in through Google again after
the backend upgrade. Private JSON is validated before rendering. There is no local-file fallback.

Use the operator migration script `deploy/orbit_storage.py` to migrate the original files
when they are available. Original source files are retained for recovery, not read at runtime.
The default health endpoint reports migrated-index readiness; `?probe=liveness` reports
process liveness only and is used for rolling app deployment. A live process without travel
data is not an operational travel timeline. The original Thailand files remain missing.
