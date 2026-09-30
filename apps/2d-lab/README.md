# 2D Lab application

An independent scene workspace at `/apps/2d-lab`, registered in Oskar Lab's launcher. Run `npm run dev -- 2d-lab` from the frontend workspace (port 10038), or `npm run dev` to launch the platform and all apps. `npm run dev -- 2d-lab --standalone` serves this app at `/`.

Object mode displays the entire scene. Select and drag objects, nudge with arrow keys, edit their centers, rename, duplicate or delete them. Vertex, Edge and Face modes select elements across every object in the same scene. Switching modes preserves the canvas, framing and zoom. Empty objects provide a starting point for free drawing. Escape cancels an active gesture. Undo/redo retains up to 50 committed edits.

The app imports `@oskar-lab/2d-lab/SceneEditor` and owns history and local persistence. The shared engine contains no routing, persistence or Room Studio imports. Room Studio remains a separate consumer of the lower-level mesh editor with its own constraints and X/Z adapter.

**Save project** downloads a versioned JSON document containing objects, meshes and measurement preferences. **Open project** validates files up to 4 MB before replacing the current scene; the replacement can be undone. **Export SVG** downloads a standalone drawing with one group per object. SVG is an output format, not the editable project input format. User object names are escaped on export. Importing arbitrary SVG, curves, modifiers, animation and boolean geometry operations are outside this version.

The current document is saved locally in this browser. Local storage is not cloud storage; use project downloads for backups or moving work between browsers. Failed initial storage reads do not overwrite existing data and leave automatic saving disabled for that session; manual project export remains available.

Run `npm run check` at the frontend root. Tests cover scene isolation, host restrictions, untrusted imports, SVG serialization and project round trips.
