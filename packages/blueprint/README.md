# Blueprint

`@oskar-lab/blueprint` is an independent 2D drawing package for vertices and edges. It has no Room Studio, furniture, Three.js, Next.js, storage or network dependency. React components use the shared `@oskar-lab/i18n` provider (English and German). The model entry point imports no React and can run on the server or in tests.

## Model and policies

```ts
import { parseBlueprint, defaultConstraints, type Blueprint } from "@oskar-lab/blueprint/model";

const drawing: Blueprint = {
  vertices: [{ id: "a", x: 0, y: 0 }, { id: "b", x: 2, y: 1 }],
  edges: [{ id: "ab", start: "a", end: "b" }],
};
const validated = parseBlueprint(drawing); // Unknown input → clean JSON-compatible data, or throws.
const outlineRules = { ...defaultConstraints, maxDegree: 2, allowIntersections: false };
```

Coordinates use an X/Y plane (X right, Y down); metric UI stores metres. A graph may be open, disconnected, branching or crossing. Default safety limits are 256 vertices, 512 edges, ±1000 m, 1 mm minimum vertex separation and 256 edges per vertex. Consumers supply a complete `BlueprintConstraints` object to change these limits, spacing and intersection rules. Duplicate edges, self-loops, missing endpoints and non-finite coordinates are always invalid.

`closedOutline` and `outlineArea` return a result only for one simple, closed, nonzero-area boundary. They do not interpret branches or multiple loops as rooms. Pure functions also provide bounds, edge lengths, vertex movement, edge splitting and polygon containment.

## Controlled React editor

```tsx
import BlueprintEditor from "@oskar-lab/blueprint/BlueprintEditor";
import MeasurementSettings from "@oskar-lab/blueprint/MeasurementSettings";

<MeasurementSettings value={measurements} onChange={setMeasurements} />
<BlueprintEditor
  value={drawing}
  onChange={setDrawing}
  measurements={measurements}
  constraints={outlineRules}
/>
```

Mount inside the shared `I18nProvider`. Pass a validated graph as `value`. The host owns the document and its lifecycle. `onChange` receives a new graph after a valid edit or completed drag; invalid gestures keep the previous document. Undo/redo is optional via `undo`, `redo`, `canUndo`, `canRedo`. Without host history, those buttons remain disabled. Use `sidebarContent` for product-specific fields such as room height. Change the component `key` when replacing an entire document to reset selection and camera state.

Drawing supports click-to-connect, dragging new vertices from existing vertices, numeric coordinate entry, splitting/deleting edges and deleting vertices with their connections. Arrow keys move a focused vertex; Enter/Space select; Escape ends drawing or cancels a drag. Meter/centimetre display and snap increments are separate from topology. Each editor owns unique SVG pattern IDs and local selection/tool state, so multiple instances can coexist.

Styles are CSS-module scoped and responsive to their container. Optional CSS properties `--blueprint-ink` and `--blueprint-fill` customize ink and enclosed-area fill. Nothing depends on host app styles. No generic plugin system, curves, multi-polygon area calculation or collaboration protocol is introduced yet.

## Consumers and compatibility

- **Room Studio** uses a small adapter between its persisted `{corners, walls}` X/Z format and Blueprint's `{vertices, edges}` X/Y format. Its room-specific limits remain in the app. Existing local drafts and v1/v2 room imports keep their format. The blueprint canvas deliberately has no furniture overlays.
- **Core & Design** includes an interactive, branching graph example under UI Design and Components, plus generated API documentation from the actual package source.

Run workspace `npm run check`; package behavior tests live in `packages/blueprint/tests`. This is a private workspace package; publishing to an external package registry is a separate step.
