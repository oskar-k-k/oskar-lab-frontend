# Room Studio

A local-first, bilingual room planner built with Three.js. Switch between a 2D floor-plan editor and 3D room design. Start with a furnished room, reshape it, and add eight kinds of parametric furniture. Undo/redo retains up to 50 edits, with one entry per completed drag.

In Floor plan, drag numbered corners or edit their X/Z coordinates. Select a wall to insert a corner or delete the wall and redraw it. The drawing tool supports clicking successive points, dragging from an endpoint, and connecting existing endpoints to close the room. Exact coordinate entry also supports drawing without a pointer; focused corners move with arrow keys. Selecting a corner displays the lengths of its connected walls. Slanted walls and concave outlines are supported. Open outlines remain editable, saveable drafts; close one continuous outline to enable 3D room design.

In Room design, dragging furniture moves it on the floor by default. Selecting furniture opens a contextual toolbar above it: Rotate exposes a horizontal drag ring; Size exposes local X (width), Y (height) and Z (depth) handles. Escape cancels an active transform. Exact dimensions, positions, rotation and colours remain available in the inspector. Global metre/centimetre display and physical step settings apply across both modes; rotation snaps to 5 degrees when snapping is enabled.

Run `npm run dev:app -- room-studio` from the frontend workspace. Open `http://localhost:10037/apps/room-studio` or use the platform catalog at port 10030. Add `--standalone` to serve at the app origin root. Production routing uses `APP_ROOM_STUDIO_URL`; the Compose service is `room-studio`.

One draft autosaves to `oskar-lab.room-studio.v1` in browser local storage. Version 2 documents contain corner/wall topology and measurement preferences; legacy version 1 rectangular documents migrate automatically. JSON export/import moves plans between devices and provides backups. Import validates topology, bounded finite dimensions, furniture kinds, IDs, preferences and colours; files are limited to 200 KB and 100 objects. Invalid saved data is not overwritten until the user explicitly enables saving. Storage failure leaves the draft editable and exportable.

An importable starter document is available at `tests/example-room.json`. On a direct app origin, set `NEXT_PUBLIC_PLATFORM_URL` from `.env.example` to point the header back to the platform. The planner itself makes no authentication requests.

The scene stores metres around a fixed X/Z origin. A single room supports up to 64 corners within −10 to +10 metres, with walls at least 5 cm long. Crossing walls, overlapping edges and branching junctions are rejected. Editing the outline preserves furniture; pieces outside the polygon or above the ceiling receive warnings. Furniture edits are fitted to the room's rectangular bounding envelope, while concave-boundary violations remain visible warnings. Objects may overlap deliberately (for example, a chair under a table or furniture on a rug). Models are schematic, not manufacturer assets. Doors, windows, holes, multi-room buildings and cloud synchronization are not included. Camera-facing walls are hidden as a cutaway; the wall toggle and overhead view expose the entire floor.

Three.js is imported only by this app's dynamically loaded viewport. Geometry, materials, controls and renderer resources are disposed on replacement/unmount. Rendering occurs on changes rather than in a continuous animation loop. WebGL failure leaves the inspector, object list and export available.

Run workspace `npm run check` for TypeScript, ESLint, unit tests and production builds.

The 2D editor and geometry utilities now come from `@oskar-lab/blueprint`. Room Studio owns its room constraints, X/Z persistence adapter, height and all furniture/3D behavior. Blueprint itself uses X/Y vertices and edges and has no furniture overlay. See `../../packages/blueprint/README.md` for the public package contract.
