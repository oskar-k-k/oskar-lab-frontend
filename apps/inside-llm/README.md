# Inside a Language Model

A continuous, abstract input-to-output scene in Oskar Lab at `/apps/inside-llm` (port 10039). It uses 2,400 seeded particles, nine transformer-inspired structures, five colors, flowing signal ribbons and a next-token distribution. Each structure contains three attention-inspired groups and connected feed-forward nodes. Signed activation vectors and compact block labels remain readable during camera travel. The camera follows a 60-second route from the whole model through its layers and back. Camera looping is on by default and can be disabled with the infinity button.

## Run and record

From the frontend workspace, run `npm run dev:app -- inside-llm` and `npm run dev:app -- oskar-lab`. Open `http://localhost:10030/apps/inside-llm`. Standalone mode: `npm run dev:app -- inside-llm --standalone`.

Enable recording mode, optionally fullscreen, and start the scene. Controls and the cursor hide after 2.4 seconds without pointer activity. Space toggles playback outside controls; Escape exits recording mode. Choose camera positions or scrub freely. The scene starts paused and pauses when the browser tab is hidden. Record with a screen recorder; no video export or audio is included.

## Rendering and meaning

`model/choreography.ts` defines the stable model geometry, moving particles and smooth camera keyframes. `model/renderer.ts` projects the scene into Canvas 2D with additive glow sprites and signal trails. Every frame is derived from absolute time, so seeking is reproducible. Canvas resolution is capped at twice the display size.

This is an artistic interpretation of computation, not an architectural diagram or inference trace. The prompt and output captions are scripted; there is no AI backend. The example prompt is “The sky is” (German: “Der Himmel ist”). Four illustrative next-token probabilities sum to 100 percent; “blue” / “blau” is highlighted as the selected completion near the output. Signed activation values update twice per second and repeat deterministically. Connections and the reduced node counts are visual abstractions, not the architecture or weights of a named model. The recording surface explicitly identifies the values as illustrative.

## Validation

Run `npm run check` in the workspace. App tests cover timeline boundaries, finite particle geometry, input-to-output ordering and the camera's return to its initial pose. Browser checks cover playback, seeking, loop controls, recording mode and mobile layout.
