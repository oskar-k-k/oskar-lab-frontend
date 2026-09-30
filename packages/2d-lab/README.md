# 2D Lab

`@oskar-lab/2d-lab` is a reusable SVG editor and framework-independent 2D topology engine. The interface calls the elements **points, edges and faces** (German: **Punkte, Kanten, Flächen**). The model uses `Vertex`, `Edge`, `Face` and `Mesh2D`.

## Shared topology

```ts
import {createFace, parseMesh, translateSelection, type Mesh2D} from "@oskar-lab/2d-lab/model";
const mesh: Mesh2D = {
  vertices: [{id:"a",x:0,y:0}, {id:"b",x:2,y:0}, {id:"c",x:1,y:1}],
  edges: [],
};
const filled = parseMesh(createFace(mesh, ["a","b","c"], "triangle"));
const moved = translateSelection(filled, {kind:"face",id:"triangle"}, {x:1,y:0});
```

Coordinates use X right / Y down, stored in metres. An edge references two vertex IDs. A face references an ordered ring of vertex IDs, whose adjacent pairs must have boundary edges. Adjacent faces reuse the same vertices and edges. Moving an edge translates both endpoints; moving a face translates all its boundary vertices once. Connected geometry follows those shared points. Vertices are never copied or detached by movement.

`createFace` reuses edges and adds missing boundary edges. `splitEdge` inserts the new point into every affected face ring. Deleting a face retains its boundary; deleting an edge or vertex removes dependent faces. Mutations return new data and must pass `validateMesh` before being committed. `parseMesh` validates untrusted JSON and strips unknown properties. Older graph-only documents may omit `faces`.

A face references at least three distinct point IDs and existing boundary edges. The strict mesh policy additionally requires nonzero area and simple outlines. Free scenes allow coincident points, collapsed faces and self-crossing outlines. Separate faces may overlap geometrically; this version has no boolean polygon operations, holes or automatic merging. `closedOutline` / `outlineArea` refer to one simple graph cycle; `faceArea` measures one explicit face.

## React editor

```tsx
import Editor2D from "@oskar-lab/2d-lab/Editor2D";
import MeasurementSettings from "@oskar-lab/2d-lab/MeasurementSettings";

<MeasurementSettings value={measurements} onChange={setMeasurements}/>
<Editor2D value={mesh} onChange={setMesh} measurements={measurements}/>
```

Mount inside the central `I18nProvider` (English/German). The host owns persistence and optional undo/redo via `undo`, `redo`, `canUndo`, `canRedo`. The editor commits valid gestures once on release. Escape/pointer cancellation discards previews. Arrow keys move focused points, edges and faces; properties provide exact positions (vertex mean for edges/faces). Use a new component key when replacing the entire document to reset local view state.

Drag a point, edge or face directly. Draw edges from points with clicks or drags. To fill a face, choose boundary points in order using Shift-click or the face-creation checkboxes, then press F or the fill button. The order is visible in the picker. Invalid faces and movements show errors without modifying the document. Meter/centimetre display and movement step are independent of topology.

`MeshConstraints` configures point/edge/face counts, coordinate limits, minimum separation, degree and free-edge intersections. The lower-level `Editor2D` / `parseMesh` defaults remain strict for existing hosts: 256 points, 512 edges, 256 faces, ±1000 m, 1 mm separation, branching and crossing edges allowed. Consumers can set `allowFaceCreation={false}` and add product fields through `sidebarContent`. Room Studio applies its existing restrictive room policy and derives a movable floor face without changing its persisted X/Z document format.

## Boundaries and preview

The model imports no React or browser code. The SVG components have no Three.js, Next.js, furniture, storage or network dependency. Styles are scoped; `--lab2d-ink` and `--lab2d-fill` customize the appearance.

Core & Design includes a live scene example with a shared-edge mesh and generated API documentation. Room Studio uses the same package through an adapter. This is a private npm workspace package, renamed from Blueprint; imports now use `@oskar-lab/2d-lab` and `Editor2D`.

## Scenes and the independent app

`apps/2d-lab` is the standalone product, linked from the platform launcher. `Scene2D` contains independent `SceneObject` records; each owns its mesh and name. IDs inside different object meshes may repeat. Coordinates are world X/Y coordinates in metres, with no hidden transform stack. `moveObject` moves all points once; `replaceObjectMesh` edits only its owning object. Mesh connectivity is preserved. Separate objects can overlap and do not merge automatically.

```tsx
import SceneEditor from "@oskar-lab/2d-lab/SceneEditor";
import {defaultEnginePolicy, type Scene2D} from "@oskar-lab/2d-lab/scene";

<SceneEditor value={scene} onChange={setScene}
  policy={{...defaultEnginePolicy, maxObjects: 8, modes: ["object", "vertex", "edge"], createFaces: false}}
  onEvent={event => { /* selection notification or validated scene commit */ }}/>
```

`EnginePolicy` defines available selection modes, object/face creation and mesh/count limits. The model enforces validation limits for scene parsing and mutations; creation flags govern creation commands and UI tools, not access control. The host owns authorization. Use `Editor2D` directly when only one mesh is needed, as Room Studio does, with `constraints`, `allowFaceCreation` and optional `selectionMode`. The room host rejects crossings and branches; the independent app uses `freeDrawingConstraints`, permitting coincident points, zero-length edges, collapsed faces and self-crossing polygons.

`SceneEditor` provides object selection, dragging, duplication, deletion and exact position fields. All modes share one stable SVG viewport and render every object. Modes restrict hit testing to objects, vertices, edges or faces; selecting any element also selects its owning object. Camera framing and zoom remain unchanged. The host receives one immutable change per completed gesture through `onChange`; optional `onEvent` reports selection and committed scenes for extensions. Product-specific UI can compose around this component or use the model commands directly. No global event bus or app-to-app dependency is required.

`parseScene` validates versioned JSON at the storage/import boundary. `exportSceneSvg` emits escaped, standalone SVG with a group for each object. The app adds JSON project import/export, history and local persistence. The default scene policy imposes no object, point, edge, face-count or coordinate caps. Finite coordinates, unique identities and intact topology references are still required so save/load and editing remain reliable. This is a focused 2D mesh editor, not the entire Blender feature set: no curves, modifiers, animation, boolean operations or arbitrary SVG import.

Run workspace `npm run check`. Package tests cover shared movement, face creation/validation/deletion, edge subdivision, graph rules, serialization and dependency boundaries.


## Navigation and multi-selection

The scene viewport pans without positional limits. Use middle-button drag, Space + left drag, or the Pan view button (also available to touch users). Wheel zoom is anchored at the cursor; zoom buttons use the view center. Frame scene restores the drawing bounds. Navigation changes only the viewport, never saved geometry or undo history. SVG text selection, native dragging and browser context menus are disabled only inside the canvas; property inputs remain normal editable fields.

Ctrl-click (Cmd-click on macOS) adds or removes objects, vertices, edges or faces in the current mode. Drag a selected element to move the whole selection; arrow keys also move a focused selection. Shared vertices are translated once, and group edits are validated atomically. Switching selection modes clears the selection while retaining the camera. `moveSceneSelections` exposes this behavior to other engine consumers. A plain click on an already selected element preserves the group for dragging; click blank space to clear it.


### Context wheel

Right-click opens the selection wheel at the cursor (clamped to the viewport). Right-clicking an unselected element selects it; right-clicking a selected element or the background preserves the current group. With no selection, the wheel offers points, edge drawing, rectangles and triangles at the clicked scene position. The Actions button and Shift+F10 also open the wheel; Escape goes back or closes it. Arrow keys/Tab navigate commands. The middle mouse button and Space-drag still pan; the right button is reserved for the wheel.

- Points: delete, extend a single point, connect two points, or create a face from three or more points in one object. Face points are ordered geometrically around their center; host policies control geometric restrictions.
- Edges: insert midpoints, form a face from one connected chain/loop, or delete with/without endpoints. An open chain is closed automatically.
- Faces: delete only faces, delete their boundary edges while keeping points, or delete their points and dependent topology.
- Objects: duplicate or delete the entire selected group. Cross-object topology joins are disabled; deleting and subdividing work across objects.

Every command is validated against the host policy and commits once for undo/redo. Deleting edges or points also removes dependent faces; removing shared boundary edges can therefore remove neighboring faces. Disabled joins indicate an invalid/existing boundary or a selection spanning independent objects. Canvas text selection remains disabled; names and property fields stay editable.

The framework-independent `@oskar-lab/2d-lab/actions` export exposes `applySelectionAction`, `canApplySelectionAction` and `validSceneSelections`. Commands return the next scene and selection, never mutate inputs, and reject invalid edits atomically. The existing Core & Design scene preview includes the context wheel; public model APIs and components are discovered by the source documentation generator.


### Free editing and drag performance

`defaultEnginePolicy` uses `freeDrawingConstraints` (unbounded counts/coordinates, zero minimum distance, intersections and degenerate faces allowed). `MeshConstraints.allowDegenerateFaces` controls geometric face checks independently of topology integrity. Use `defaultConstraints` or explicit domain limits when embedding a constrained editor. Policies are runtime configuration; Infinity values are not part of saved scene JSON.

Free-scene validation skips pairwise proximity/intersection checks and uses indexed topology lookups. Pointer previews are coalesced to one update per animation frame, then committed exactly once on release. No geometry warning banner changes the canvas layout during a gesture. Unexpected rejected commands receive a small status message below the fixed canvas; constrained hosts keep the last valid preview until release.


Selection is highlighted in orange across geometry and the outliner. Selection modes use accessible SVG icon buttons with translated hover/focus tooltips. The context wheel uses clickable annular segments with icons and labels, including nested command rings. Mouse focus does not draw a canvas border; keyboard focus retains an orange indicator.


### Rotation and origins

Each object has a persistent world-space origin, shown as a small point in object mode. Legacy version-1 documents without `origin` migrate to the initial geometry bounding-box center when parsed; newly created primitives use (0, 0), translated to their placement position. Object dragging and position fields move both geometry and origin. Editing mesh points leaves the origin fixed. The origin fields move only the pivot, and Origin to geometry center resets it without moving geometry. JSON persistence and duplication retain origins; SVG export contains baked world geometry.

Select Rotate in the context wheel or toolbar, then drag the orange ring (or selected geometry). Shift snaps to 15-degree increments; Escape cancels a drag. Exact relative angles and ±90° buttons are available in the inspector. Positive angles rotate clockwise because the canvas uses Y-down coordinates. One object rotates about its origin; a group rotates about the mean of selected origins, including moving those origins. Edges, faces and selections of two or more unique points rotate about the mean of selected points, across objects if needed. Shared points transform once, dependent geometry follows, and partial mesh rotation does not move object origins. Each completed rotation creates one undo step.

The public scene API includes `objectOrigin`, `setObjectOrigin`, `rotationPivot` and `rotateSceneSelections`. Commands validate the complete result against the host policy and do not mutate input scenes.
