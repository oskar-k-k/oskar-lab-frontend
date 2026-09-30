# Room Studio

A local-first, bilingual 3D room planner built with Three.js. Start with a furnished room or clear it, set a rectangular room's real dimensions, and add eight kinds of parametric furniture. Drag pieces on the floor, orbit/zoom, switch to the overhead view, and adjust exact dimensions, position, rotation and colours in the inspector. Every edit is also available without dragging. Undo/redo retains up to 50 edits.

Run `npm run dev:app -- room-studio` from the frontend workspace. Open `http://localhost:10037/apps/room-studio` or use the platform catalog at port 10030. Add `--standalone` to serve at the app origin root. Production routing uses `APP_ROOM_STUDIO_URL`; the Compose service is `room-studio`.

One draft autosaves to `oskar-lab.room-studio.v1` in browser local storage. JSON export/import moves plans between devices and provides backups. Import validates version, bounded finite dimensions, furniture kinds, IDs and colours; files are limited to 200 KB and 100 objects. Invalid saved data is not overwritten until the user explicitly enables saving. Storage failure leaves the draft editable and exportable.

An importable starter document is available at `tests/example-room.json`. On a direct app origin, set `NEXT_PUBLIC_PLATFORM_URL` from `.env.example` to point the header back to the platform. The planner itself makes no authentication requests.

The scene uses metres and a centred X/Z floor plane. Dragging optionally snaps to 10 cm. Furniture stays inside the rotated room footprint; reducing the room may reduce oversized pieces. Objects may overlap deliberately (for example, a chair under a table or furniture on a rug). Models are schematic, not manufacturer assets. Rooms are rectangular; doors, windows, custom wall outlines, multi-room buildings and cloud synchronization are not included. Two walls are shown as a cutaway; the wall toggle and overhead view expose the entire floor.

Three.js is imported only by this app's dynamically loaded viewport. Geometry, materials, controls and renderer resources are disposed on replacement/unmount. Rendering occurs on changes rather than in a continuous animation loop. WebGL failure leaves the inspector, object list and export available.

Run workspace `npm run check` for TypeScript, ESLint, unit tests and production builds.
