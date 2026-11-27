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
localStorage, analytics, mailbox synchronization or server-side geocoding is added. Optional
Google map embeds are described below.
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
external stock photos or automatic document thumbnails. Optional maps are a separate explicit action. No personal data, API, storage,
sharing or authorization behavior changes with this presentation update.

Flights and boats in reading view have separate departure and arrival bubbles on the same side, linked
by a dashed downward arrow with backend-computed elapsed duration. Both display their own
local date, time and place and open only their respective station details. The domain keeps one atomic
transport entry; edit mode keeps its combined card. Unknown durations are labeled, never
inferred by subtracting local clock hours. The shared Timeline exposes neutral `end` and
`connectionLabel` slots for the same pattern in other apps; no data/storage changes occur.

Station date/time labels are centered on the vertical main rail, level with each bubble. Each shows the date above a centered second line with time and zone, e.g. `17.12` / `10:00 (UTC+4)`, with the backend-validated
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


## Optional key-free location maps

Each station stores an optional `mapEmbedUrl` copied from Google Maps → Share → Embed a map.
Owners can paste the embed URL or copied iframe HTML into the station's editor; only the
validated URL is saved. The backend stores it with the private point and enforces existing
owner/viewer permissions. Map links are deleted with the point; backup retention still applies.
Only `https://www.google.com/maps/embed?pb=...` with optional `hl` is allowed. Arbitrary hosts,
userinfo, fragments, API-key paths/parameters and unknown/duplicate parameters are rejected
on both boundaries. No Cloud API key, billing account or server-side geocoding is used.

Saved previews embed automatically with native `loading="lazy"`, without a separate loading
confirmation. The browser controls fetch timing, including for maps inside collapsed details;
no guarantee is made that a request waits for a particular disclosure action. Missing embeds
keep a local empty state and an outbound location link. Google receives the saved embed location,
IP address and browser/device information. Referrers are suppressed. No trip URL, dates, notes,
booking references, documents or account identifiers are included in the embed URL. Google may
use cookies and process data outside the EEA; its retention/transfer terms and the legal basis
for automatic third-party embeds remain operator review items. No consent preference is stored.
Google attribution remains visible and interactive at the bottom. This automatic loading mode
was explicitly requested by the owner; it is not a claim that consent is legally unnecessary.

The iframe uses the validated embed URL, but preview clicks and outbound links always open a
normal Maps page. Recognized Google share-embed venue IDs use Google's Maps CID destination
with exact 64-bit conversion, or a Maps search URL with `query_place_id` for supported place IDs.
The share-embed payload is an external format and may change; if no identifier is recognized,
the outbound link falls back to the saved place/address search. No embed URL is opened as a
standalone page. Missing/incomplete addresses can still produce ambiguous fallback results.
No external lookup or new storage is needed to derive the link.

The initial Cloud-API implementation was replaced at the owner's request. The `/api/maps`
configuration endpoint and key environment setting are removed. No Google key was created,
no payment details were entered, and Google's billing onboarding was not completed.

Official help: https://support.google.com/maps/answer/144361

Station artwork uses local, transparent SVG illustrations for flights, boats and stays. Activities keep their circular artwork. The shared Timeline exposes a neutral `visualStyle` option; booking types remain app-owned. No new data flow, permissions or external assets are introduced.

The normal detail view shows optional `bookingSource` as plain text (for example, “Booked via Booking.com”) instead of a document button. Owners can edit the source in the booking form; missing sources are omitted rather than inferred. Existing attachment management remains available in edit mode. Booking sources share the trip's authorization, storage and deletion rules and create no external request.

Stay points have optional `timelineTime` and `timelineUtcOffset` fields for planned arrival/departure on their saved date. Timeline sorting and labels use those fields, never check-in/out windows. Unknown plans remain date-only. Accommodation policy times stay visible in details. Calendar-night counts use date differences, not elapsed hours. Shared Timeline ranges keep stay endpoints connected without moving intervening activities. These private fields share existing authorization and deletion behavior; no new recipient or external service is introduced. Owner-approved boat-to-hotel estimates use 45 minutes after a matching arrival and are plans, not confirmed hotel policy.

Edit mode preserves the visual timeline, ranges and atmosphere. Owners can activate a station date/time label to open a small native dialog. Hotel labels edit the separate plan, never accommodation policy times. Saves preserve sibling points and booking metadata, use the existing versioned owner API and update in-memory entries without reloading or scrolling the trip. Failed/conflicting writes retain dialog input and require normal reload before unsafe retries. The header remains one row; secondary trip actions live in a compact menu. No additional storage, recipients or permissions are introduced.


## Directions from saved trip locations

Eligible station details show a local route-origin picker below the map. Active accommodation
is preferred for independent activities; otherwise the latest previous stay or transport arrival
is suggested. The same booking, future anchors and identical destinations are excluded. Connected
arrival, check-out and end stations do not show incoming directions. Unknown times use their
local calendar day for suggestions; these are editable choices, not confirmed transfer plans.

Options are computed in memory from the currently authorized trip, with no new storage or API.
Selecting an option sends no request. Opening directions sends only the selected saved origin
and destination names/addresses to Google Maps, not trip dates, notes, documents or account data.
The current-location option omits the origin: Google handles any device location/permission itself.
TravelTime never requests geolocation. Maps controls its own retention and processing as described
above. No Routes API, billing, travel-time lookup or automatic itinerary rescheduling is introduced.

Accommodation captions include the saved check-in/out policy time with its from/until meaning, independently of planned timeline times. Unknown policy times remain omitted; no window end is inferred. This display-only change adds no storage or external data flow.

TravelTime starts without an automatically highlighted milestone; station highlights follow opened details. Arrival planes face down-left and departure boats are mirrored. Artwork remains local SVG with no additional assets or data flow.


## Packing list

The top-left Packing list button opens a native full-screen modal with trapped focus,
Escape/back navigation and focus restoration. Person tabs support arrow/Home/End keys.
Normal mode saves checks immediately. Edit mode keeps person/group/item changes in memory
until Save changes; Cancel discards them. Counts show checked/total per group, person and
whole trip. Checks and labels are read from the database whenever the list opens.

`GET/PUT /api/travel/{tripId}/packing` forwards the existing authenticated trip boundary.
The backend stores ordered person, group and item rows under a versioned trip packing list.
Only the owner can write (including checks); verified trip viewers retain read-only access.
Person names are labels and grant no permissions. Limits are 12 people, 40 groups per person,
100 groups total, 100 items per group and 500 items total. Names are at most 80/100/200 characters.
Stale or ambiguous writes block further saves until the user reloads the stored list.
Failures preserve the local edit draft; reloading or leaving it asks before discarding it.
Offline controls and pending writes are disabled. No write is automatically retried.

Purpose: store the requested private checklist and checks across visits/devices. Recipients
are the existing backend/database/backup host and authorized trip readers. Labels and checks
remain until individually removed or the trip/account is deleted; cascading rows are removed
from the active database. Existing backup retention still needs operator confirmation.
No extra external requests, browser storage, analytics, location permission, assets or
third-party dependencies are introduced. The modal does not include Maps embeds.


## Mobile navigation and saved inspiration

TravelNavigation supplies five app-local destinations: Packing list, Timeline, Add booking,
Saved and Trips. At widths up to 760px the platform header is hidden and a fixed icon-only
bottom dock exposes accessible names, focus indicators and the current destination. Safe-area
padding and bottom content clearance keep controls usable above device home indicators.
Desktop shows the same five destinations with text in the top header. Timeline editing and
motion controls remain available in the timeline itself. Packing's native modal contains its
own navigation; its draft-discard check runs before leaving. Booking and saved-place drafts
also ask before navigation discards input. Navigation has no new persistent browser state.

Saved keeps inspiration separate from confirmed bookings: manual title, optional HTTP(S)
URL, and optional notes. Reels are stored as links, with no scraping, remote thumbnails,
embeds, API integrations or external requests until a user opens a link. Links suppress
referrers and use noopener/noreferrer. Unsafe schemes and credential-bearing URLs are rejected
at both boundaries. GET /api/travel/{tripId}/saved is paginated (20 per page); POST creates,
PUT /saved/{id} updates, DELETE /saved/{id}?version=... removes an item. Writes are owner-only
and version checked; verified trip viewers can read. Lists are bounded to 500 items/trip.

The existing database/backup provider stores these private titles, URLs and notes to provide
this requested collection. Authorized trip readers can see them; nothing is published.
Rows remain until individually deleted or the trip/account is deleted. Active database rows
cascade with their parent; existing backup deletion schedules still need operator confirmation.
No extra analytics, external service, browser permission or third-party asset is introduced.
