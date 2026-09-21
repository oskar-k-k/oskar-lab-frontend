# Workout — reusable sessions

Step 1 provides an exercise catalog, three source A/B/C templates, personal plans,
a mobile-first editor, and personal per-set tracking with dated exercise history.
There is no calendar or analytics.

## Run

From `frontend`, run `npm install`, then `npm run dev` (all apps), or
`npm run dev:app -- workout` with the platform running separately on port 10030.
Integrated URL: `/apps/workout`; app server: port 10036.
`npm run dev:app -- workout --standalone` serves the app at `/`.

Copy `.env.example` to `.env.local` and set the **same server-only**
`AUTH_BRIDGE_SECRET` used by the platform/backend. Keep `AUTH_PLATFORM_URL`
pointing to the central platform. No provider credentials belong in this app.
If a reverse proxy uses a different public origin, set `WORKOUT_PUBLIC_URL` to
that exact origin; only configured origins may submit writes.
The backend runs Flyway V4/V5 to create and seed the workout tables in Postgres.
Use the same hostname for app and platform locally so platform cookies are shared.

## Data and API

The Next route `/api/workout/[...path]` validates the central platform session,
rejects cross-origin mutations, and passes the internal account ID to the private
Spring API using `X-Auth-Bridge`. The browser never receives this secret.
The backend validates account completion and scopes all personal queries by owner.
Do not expose or distribute the bridge key to untrusted services.

| Method | Path relative to `/internal/workout` | Behavior |
| --- | --- | --- |
| GET | `/exercises` | Bilingual exercise catalog |
| GET | `/templates` | Three read-only source sessions |
| GET | `/plans?page=0` | Personal plans, 20 per page |
| GET | `/plans/{id}` | Owner-scoped plan |
| POST | `/plans` | Create using a client-generated UUID; retries reuse the ID |
| PUT | `/plans/{id}` | Atomic replacement with optimistic version checking |

Plans contain `id`, `version`, `name`, `notes`, and ordered `exercises`.
Each entry has `exerciseId`, `setsMin/setsMax`, `mode` (`reps`, `seconds`, or
`unspecified`), `targetMin/targetMax`, `restMin/restMax`, `superset`, and `notes`.
Durations use seconds. Unspecified ranges use **two nulls**. Fixed ranges use equal
bounds. Group labels associate superset entries; optional combinations belong in
notes. Repeated exercise IDs are allowed. The array defines order.

Templates are never edited in place: customizing creates a private copy.
Seed content preserves the supplied tables: 27 exercise entries and 11 rows per
session. Alternatives such as “Hack Squat / Squat” remain combined catalog entries.
Source notes remain German user content; UI and exercise names support EN/DE.
Plan C retains three squat plus three RDL sets from the table, rather than the
inconsistent five-set prose summary. Missing hold/rest targets stay unspecified.

Failed saves retain the open draft. HTTP 409 requires reopening a current plan;
the UI instructs users to copy needed edits before discarding the stale draft.
Drafts are memory-only and do not survive a browser reload.

## Verification

Run `npm run check` at the frontend root and `gradlew test build` in `backend`.
Tests cover contract validation, immutable ordering, source seed ranges, owner
isolation, invalid input, safe create retries, persistence and stale child edits.
If this Windows JDK cannot create Unix-domain loopback pipes, a process-local
`JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=<nonexistent-directory>` makes it
fall back to TCP. This is an environment workaround, not an application setting.

Verified locally: PostgreSQL 16 migrations and schema validation; all frontend
workspace checks and builds; 43 frontend tests and 16 backend tests; browser
create/edit/reload through the platform proxy at a 390px viewport. The browser
check used a synthetic local account, including save retry after a service restart.

## Focused session navigation

Selecting a plan opens `/sessions/{id}` with only that session and a sticky
back-to-plans header. The URL survives reloads and direct visits. Personal session
links require their owner to sign in. Session rows are compact on mobile; long
technique/combination notes and plan notes remain available in disclosures.
The same dedicated session route is used on desktop.

## Exercise focus

Session rows show only the exercise name and prescription. Opening a row navigates
to `/sessions/{id}/exercises/{position}`; the zero-based position distinguishes
repeated exercises and refers to the current plan order. This full-page view shows
compact rows for sets, repetitions or duration, and rest, followed by exercise notes.
The superset label appears once above the tabs. Its back link returns
to the session, including after a direct visit or reload. Invalid positions show
a recoverable message. Plan notes remain collapsed below the session list.

Superset rows share a bordered visual group and labeled connection line without
changing exercise order. Exercise pages expose all members of the selected group
using the shared Tabs component; single exercises get one tab. All group content
is loaded together and switches locally without navigation or new requests. The
URL retains the entry exercise, which is selected again on reload. Arrow keys and
Home/End activate tabs immediately; hidden panels preserve their local state. Non-adjacent members
retain their original list positions and share the same group label and tabs.

## Set tracking

Tracking is available directly from `/exercises` and `/exercises/{id}`, or inside
session exercise details. Logs belong only to the account and catalog exercise.
Users select repetitions or seconds and can optionally add weight to either unit.
Plan `trackingMode` values provide initial form defaults, not restrictions.
Dumbbell weights refer to one dumbbell; bodyweight movements use added load.

Blank rows are skipped, zero is valid, and up to 100 sets are supported. Each save
creates an immutable dated entry. History shows the exercise name across plans,
with recorded units and optional weight. Dates use UTC and display in the device
timezone. History is paginated in groups of 20 and remains append-only.

`POST /internal/workout/logs` accepts a client UUID, exercise ID, tracking mode and
ordered `{setNumber, value, weight}` rows. No plan is required. Identical retries
return the original entry; changed data conflicts. Inserts use persist rather than
merge to prevent concurrent retry overwrites. Legacy `weighted` units remain
readable. V7 makes historical plan metadata nullable without deleting old records.
`GET /internal/workout/history/{exerciseId}?page=0` returns only the caller's logs.
Both routes use the existing platform bridge and completed-account checks.

Drafts survive tab changes and failed saves. Session storage scopes drafts by
account and exercise within the browser tab. An uncertain request freezes its
payload until a safe retry. Confirmed saves clear the draft. Storage denial falls
back to memory with an unload warning for unfinished input.

Plan editing uses shared two-handle RangeSlider controls for sets, targets and rests.
Exact inputs retain the full supported numeric bounds; practical slider scales
expand to include larger existing values. Open rests use an explicit checkbox.
