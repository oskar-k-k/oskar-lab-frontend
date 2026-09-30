# 2D Lab application

An independent scene workspace at `/apps/2d-lab`, registered in Oskar Lab's launcher. Run `npm run dev -- 2d-lab` from the frontend workspace (port 10038), or `npm run dev` to launch the platform and all apps. `npm run dev -- 2d-lab --standalone` serves this app at `/`.

Object mode displays the entire scene. Select and drag objects, nudge with arrow keys, edit their centers, rename, duplicate or delete them. Vertex, Edge and Face modes select elements across every object in the same scene. Switching modes preserves the canvas, framing and zoom. Empty objects provide a starting point for free drawing. Escape cancels an active gesture. Undo/redo retains up to 50 committed edits.

The app imports `@oskar-lab/2d-lab/SceneEditor` and owns history and local persistence. The shared engine contains no routing, persistence or Room Studio imports. Room Studio remains a separate consumer of the lower-level mesh editor with its own constraints and X/Z adapter.

**Save project** downloads a versioned JSON document containing objects, meshes and measurement preferences. **Open project** validates files up to 4 MB before replacing the current scene; the replacement can be undone. **Export SVG** downloads a standalone drawing with one group per object. SVG is an output format, not the editable project input format. User object names are escaped on export. Importing arbitrary SVG, curves, modifiers, animation and boolean geometry operations are outside this version.

The current document is saved locally in this browser. Local storage is not cloud storage; use project downloads for backups or moving work between browsers. Failed initial storage reads do not overwrite existing data and leave automatic saving disabled for that session; manual project export remains available.

Run `npm run check` at the frontend root. Tests cover scene isolation, host restrictions, untrusted imports, SVG serialization and project round trips.


## Navigation and multi-selection

The scene viewport pans without positional limits. Use middle/right-button drag, Space + left drag, or the Pan view button (also available to touch users). Wheel zoom is anchored at the cursor; zoom buttons use the view center. Frame scene restores the drawing bounds. Navigation changes only the viewport, never saved geometry or undo history. SVG text selection, native dragging and context menus are disabled only inside the canvas; property inputs remain normal editable fields.

Ctrl-click (Cmd-click on macOS) adds or removes objects, vertices, edges or faces in the current mode. Drag a selected element to move the whole selection; arrow keys also move a focused selection. Shared vertices are translated once, and group edits are validated atomically. Switching selection modes clears the selection while retaining the camera. `moveSceneSelections` exposes this behavior to other engine consumers. A plain click on an already selected element preserves the group for dragging; click blank space to clear it.
