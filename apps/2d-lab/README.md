# 2D Lab application

An independent scene workspace at `/apps/2d-lab`, registered in Oskar Lab's launcher. Run `npm run dev -- 2d-lab` from the frontend workspace (port 10038), or `npm run dev` to launch the platform and all apps. `npm run dev -- 2d-lab --standalone` serves this app at `/`.

Object mode displays the entire scene. Select and drag objects, nudge with arrow keys, edit their centers, rename, duplicate or delete them. Vertex, Edge and Face modes select elements across every object in the same scene. Switching modes preserves the canvas, framing and zoom. Empty objects provide a starting point for free drawing. Escape cancels an active gesture. Undo/redo retains up to 50 committed edits.

The app imports `@oskar-lab/2d-lab/SceneEditor` and owns history and local persistence. The shared engine contains no routing, persistence or Room Studio imports. Room Studio remains a separate consumer of the lower-level mesh editor with its own constraints and X/Z adapter.

**Save project** downloads a versioned JSON document containing objects, meshes and measurement preferences. **Open project** validates files up to 4 MB before replacing the current scene; the replacement can be undone. **Export SVG** downloads a standalone drawing with one group per object. SVG is an output format, not the editable project input format. User object names are escaped on export. Importing arbitrary SVG, curves, modifiers, animation and boolean geometry operations are outside this version.

The current document is saved locally in this browser. Local storage is not cloud storage; use project downloads for backups or moving work between browsers. Failed initial storage reads do not overwrite existing data and leave automatic saving disabled for that session; manual project export remains available.

Run `npm run check` at the frontend root. Tests cover scene isolation, host restrictions, untrusted imports, SVG serialization and project round trips.


## Navigation and multi-selection

The scene viewport pans without positional limits. Use middle-button drag, Space + left drag, or the Pan view button (also available to touch users). Wheel zoom is anchored at the cursor; zoom buttons use the view center. Frame scene restores the drawing bounds. Navigation changes only the viewport, never saved geometry or undo history. SVG text selection, native dragging and browser context menus are disabled only inside the canvas; property inputs remain normal editable fields.

Ctrl-click (Cmd-click on macOS) adds or removes objects, vertices, edges or faces in the current mode. Drag a selected element to move the whole selection; arrow keys also move a focused selection. Shared vertices are translated once, and group edits are validated atomically. Switching selection modes clears the selection while retaining the camera. `moveSceneSelections` exposes this behavior to other engine consumers. A plain click on an already selected element preserves the group for dragging; click blank space to clear it.


### Context wheel

Right-click opens the selection wheel at the cursor (clamped to the viewport). Right-clicking an unselected element selects it; right-clicking a selected element or the background preserves the current group. With no selection, the wheel offers points, edge drawing, rectangles and triangles at the clicked scene position. The Actions button and Shift+F10 also open the wheel; Escape goes back or closes it. Arrow keys/Tab navigate commands. The middle mouse button and Space-drag still pan; the right button is reserved for the wheel.

- Points: delete, extend a single point, connect two points, or create a face from three or more points in one object. Face points are ordered geometrically around their center.
- Edges: insert midpoints, form a face from one connected chain/loop, or delete with/without endpoints. An open chain is closed automatically.
- Faces: delete only faces, delete their boundary edges while keeping points, or delete their points and dependent topology.
- Objects: duplicate or delete the entire selected group. Cross-object topology joins are disabled; deleting and subdividing work across objects.

Every command is validated against the host policy and commits once for undo/redo. Deleting edges or points also removes dependent faces; removing shared boundary edges can therefore remove neighboring faces. Disabled joins indicate an invalid/existing boundary or a selection spanning independent objects. Canvas text selection remains disabled; names and property fields stay editable.


### Unrestricted geometry

The independent app uses the engine's free-drawing policy: points can coincide, edges may collapse, faces may overlap or self-cross, and there are no artificial coordinate or element-count caps. These states survive save/load and JSON/SVG export. Structural file checks and the existing file-size boundary remain. Restricted embedding hosts can still opt into domain-specific geometry rules.

Dragging renders at most one preview per animation frame, without pairwise geometry rejection or a layout-shifting warning banner.


Selection is highlighted in orange across geometry and the outliner. Selection modes use accessible SVG icon buttons with translated hover/focus tooltips. The context wheel uses clickable annular segments with icons and labels, including nested command rings. Mouse focus does not draw a canvas border; keyboard focus retains an orange indicator.


### Rotation and origins

Each object has a persistent world-space origin, shown as a small point in object mode. Legacy version-1 documents without `origin` migrate to the initial geometry bounding-box center when parsed; newly created primitives use (0, 0), translated to their placement position. Object dragging and position fields move both geometry and origin. Editing mesh points leaves the origin fixed. The origin fields move only the pivot, and Origin to geometry center resets it without moving geometry. JSON persistence and duplication retain origins; SVG export contains baked world geometry.

Select Rotate in the context wheel or toolbar, then drag the orange ring (or selected geometry). Shift snaps to 15-degree increments; Escape cancels a drag. Exact relative angles and ±90° buttons are available in the inspector. Positive angles rotate clockwise because the canvas uses Y-down coordinates. One object rotates about its origin; a group rotates about the mean of selected origins, including moving those origins. Edges, faces and selections of two or more unique points rotate about the mean of selected points, across objects if needed. Shared points transform once, dependent geometry follows, and partial mesh rotation does not move object origins. Each completed rotation creates one undo step.

The public scene API includes `objectOrigin`, `setObjectOrigin`, `rotationPivot` and `rotateSceneSelections`. Commands validate the complete result against the host policy and do not mutate input scenes.
