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

A face must have at least three distinct points, nonzero area, existing boundary edges and a non-self-intersecting outline. Face rings remain simple even when free edge crossings are allowed. Separate faces may overlap geometrically; this version has no boolean polygon operations, holes or automatic merging. `closedOutline` / `outlineArea` refer to one simple graph cycle; `faceArea` measures one explicit face.

## React editor

```tsx
import Editor2D from "@oskar-lab/2d-lab/Editor2D";
import MeasurementSettings from "@oskar-lab/2d-lab/MeasurementSettings";

<MeasurementSettings value={measurements} onChange={setMeasurements}/>
<Editor2D value={mesh} onChange={setMesh} measurements={measurements}/>
```

Mount inside the central `I18nProvider` (English/German). The host owns persistence and optional undo/redo via `undo`, `redo`, `canUndo`, `canRedo`. The editor commits valid gestures once on release. Escape/pointer cancellation discards previews. Arrow keys move focused points, edges and faces; properties provide exact positions (vertex mean for edges/faces). Use a new component key when replacing the entire document to reset local view state.

Drag a point, edge or face directly. Draw edges from points with clicks or drags. To fill a face, choose boundary points in order using Shift-click or the face-creation checkboxes, then press F or the fill button. The order is visible in the picker. Invalid faces and movements show errors without modifying the document. Meter/centimetre display and movement step are independent of topology.

`MeshConstraints` configures point/edge/face counts, coordinate limits, minimum separation, degree and free-edge intersections. Default limits: 256 points, 512 edges, 256 faces, ±1000 m, 1 mm separation, branching and crossing edges allowed. Consumers can set `allowFaceCreation={false}` and add product fields through `sidebarContent`. Room Studio applies its existing restrictive room policy and derives a movable floor face without changing its persisted X/Z document format.

## Boundaries and preview

The model imports no React or browser code. The SVG components have no Three.js, Next.js, furniture, storage or network dependency. Styles are scoped; `--lab2d-ink` and `--lab2d-fill` customize the appearance.

Core & Design includes a live two-face example with a shared edge and generated API documentation. Room Studio uses the same package through an adapter. This is a private npm workspace package, renamed from Blueprint; imports now use `@oskar-lab/2d-lab` and `Editor2D`. It implements basic direct mesh editing, not the full Blender toolset (no extrusion, modifiers or multi-object scenes).

Run workspace `npm run check`. Package tests cover shared movement, face creation/validation/deletion, edge subdivision, graph rules, serialization and dependency boundaries.
