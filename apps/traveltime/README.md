# TravelTime

Private booked-trip timelines at `/apps/traveltime` (development port 10042).
Create a trip, add confirmed flights, stays or activities, then optionally grant read-only
access to verified email addresses. Original `/apps/thailand` remains a separate snapshot.
Unknown times remain unknown. Hotels render as linked check-in/check-out milestones with
other activities between them; transports render as connected endpoints and elapsed duration.
Trip notes, booking references, addresses and private PDF/PNG/JPEG attachments are supported.

## Boundaries

`@oskar-lab/ui/Timeline/Timeline` owns the generic ordered layout and responsive markers.
TravelTime owns grouping, time semantics, forms and requests. The shared component has no
API, account or travel dependency. Core & Design includes live previews and its generated API.
The authenticated `/api/travel` adapter derives an internal user ID from the central account
session and proxies only allowlisted travel routes. It never forwards caller identity headers.
Both EN and DE text live in the central i18n package. Server contracts come from `@oskar-lab/api`;
responses are validated before entering UI state. Backend permissions are authoritative.

The backend API and privacy/storage behavior are documented in `backend/docs/travel-api.md`
in the sibling backend repository. Owners edit; verified-email viewers only read. Invitations
send no mail. Stale versions require reloading. Unknown write outcomes are never automatically
replayed; reload before another write. Session identity changes remount the workspace and
clear in-memory private data. Private responses disable caching and referrers; no service worker,
localStorage, analytics, mailbox synchronization, geocoding, map embed or external asset is added.
Documents are downloaded with attachment disposition and never rendered as active HTML.

## Data and privacy

Travel dates, addresses, references, notes, documents and viewer emails are used only for the
private trip and explicitly requested sharing. Recipients are the owner and their verified
viewers, plus existing Oskar Lab/OrbitStorage hosting, database, backup and S3 operators.
PostgreSQL stores records and file references. New attachments use the dedicated `traveltime`
OrbitStorage project; older `thailand` references remain readable. Never put real bookings,
mail exports, signed links, tokens or document bytes in Git, public assets, fixtures or logs.
Operator imports must resolve the requested account to its existing internal ID, apply normal
backend validation, create no viewer grants and verify anonymous/other-account denial.

Owner deletion removes metadata and queues durable cloud deletion. Backups may retain prior
copies; retention and tested restore policy still require operator confirmation. Shared files
already downloaded cannot be recalled. Existing platform legal/contact disclosures apply;
this feature adds no payments or new browser permissions. Project-wide storage limits and
upload rate limits exist in OrbitStorage; account-wide usage controls and restore exercises
remain required before a broad public launch. This is an Oskar Lab pilot, not a store release.
The requested working name TravelTime is also used by an existing location technology company
(https://traveltime.com/about-us); independent branding review is needed before separate public
marketing/store distribution. No uniqueness or trademark clearance is claimed.

## Verification

Run `npm run check` at the frontend workspace root. Tests cover the browser authorization
boundary, invalid responses, hotel interleaving, offsets/date-only times and shared timeline
semantics. Check desktop/mobile forms and timeline, loading/empty/error states and keyboard
focus. Local UI fixtures must be synthetic and ignored; never claim those replace real backend
permission/storage tests. The backend CI separately validates Flyway with isolated PostgreSQL.

## Timeline presentation

The default reading view uses the shared Timeline `bubbles` variant: alternating circular
local illustrations around one central rail, with short titles and local date/time labels.
Native summary/disclosure controls reveal one booking at a time and support keyboard use.
Owners switch to Edit timeline for the existing expanded card layout and management actions.
The shared component accepts caller-owned React visuals (including approved local/private
images) without fetching media itself. TravelTime uses locally authored SVG scenes, never
external stock photos, maps or automatic document thumbnails. No personal data, API, storage,
sharing or authorization behavior changes with this presentation update.

Flights and boats in reading view have separate departure and arrival bubbles on the same side, linked
by a dashed downward arrow with backend-computed elapsed duration. Both display their own
local date, time and place and open only their respective station details. The domain keeps one atomic
transport entry; edit mode keeps its combined card. Unknown durations are labeled, never
inferred by subtracting local clock hours. The shared Timeline exposes neutral `end` and
`connectionLabel` slots for the same pattern in other apps; no data/storage changes occur.

Station date/time labels sit on the horizontal rail connection. Each uses one compact line, e.g. `17.12 - 10:00 (UTC+4)`, with the backend-validated
UTC offset at that instant. The full IANA zone remains in the expanded details and label tooltip;
unknown times do not invent an offset.
Flight and boat departure and arrival disclosures render only the selected endpoint, with shared
booking notes/documents; edit mode retains both endpoints. The shared bubble layout keeps
rail labels readable at mobile widths and moves them above the circle while expanded.
No additional processing, external requests, storage or permissions are introduced.

The shared `start` slot introduces the reading timeline with a centered bubble containing
the trip title and localized date range. It is not an interactive booking station.

The trip reading view starts directly at the opening bubble with numeric dates. Navigation
and editing actions live in the sticky header, including a horizontally scrollable action row
on narrow screens. The trip title is supplied by the saved trip, never inferred from bookings.


## Night theme

TravelTime uses a scoped midnight palette with white text and light timeline rails. Forms,
notices, header actions and expanded booking details share the same accessible dark surfaces.
Station artwork is decorative local SVG. Trips with Thailand in their saved title receive
an original, locally served AI-generated destination cover; other trips keep the neutral
opening bubble. Asset provenance and the full generation prompt are in [ARTWORK.md](ARTWORK.md).
No private trip data is sent to image generation or third-party image hosts.


## Ambient atmosphere

Two decorative CSS layers add slow coastal light and static contour lines behind the page.
Only the light layer's transform animates (32-second alternating cycle); no canvas, animation
library, scroll/pointer listener or external request is used. Animation runs only in the trip
reading view, respects `prefers-reduced-motion`, and can be paused from the header. The choice
is in-memory only, with no account settings or storage changes. Decorative layers cannot
intercept clicks. Rail gradients and station shadows use optional shared Timeline tokens,
with existing defaults preserved for other callers and a preview in Core & Design.
