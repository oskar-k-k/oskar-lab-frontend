# Tierlist Matcher

Start the shared backend and run `npm run dev:app -- tierlist-matcher` from the
frontend workspace. Open http://localhost:10040/apps/tierlist-matcher or the
platform route http://localhost:10030/apps/tierlist-matcher.
Standalone: `npm run dev:app -- tierlist-matcher --standalone`.

Guests create a room with 2–8 named rows, share its six-digit code and start
with 2–8 players. Everyone ranks the same shuffled term. The server reveals
answers only after all players submit; the host advances each round.
Only the current term is visible during each round. The final screen contains
everyone's complete list side by side, with your column first. Match scores
average revealed tier distances relative to your choices. Images are optional
local illustrations; intimate terms use abstract symbols.
Invite links show only a name field and a join button. Categories are optional;
custom words (one per line) are mixed into a selected category or used alone.
Duplicates are removed case-insensitively. Hosts select 1–100 rounds, capped
by the available unique terms. This app does not perform age verification.

Rooms use server memory, expire after two hours without requests and disappear
on backend restart. A tab's reconnect credential is kept in sessionStorage;
closing the tab loses it. Refreshing the same tab resumes the player.
There is no account association or persistent storage of intimate preferences.
Room membership locks after start. A missing player must reconnect; there is
currently no kick, leave, timeout or automatic host transfer.

State synchronizes every 1.5 seconds through a same-origin Next.js proxy, not
WebSockets. The backend URL is server-only. Deploy a single backend instance;
distributed room state and abuse/IP rate limits are needed before scaling.
Production deployment requires installing the updated deploy/compose.yml and
deploy/deploy.sh on the host before the GitHub Actions frontend release.
