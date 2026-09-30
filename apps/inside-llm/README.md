# Inside a Language Model

An independent Oskar Lab app at `/apps/inside-llm`, port 10039. It presents a 90-second conceptual film, with six chapters, English/German localization, scrubbing, playback speed and a 16:9 recording view. All content runs locally without an AI service.

## Run

From the frontend workspace: `npm run dev:app -- inside-llm`. Start `npm run dev:app -- oskar-lab` as well to access the app through the platform at `http://localhost:10030/apps/inside-llm`. For an origin-root deployment: `npm run dev:app -- inside-llm --standalone`.

## Record

Select a language, restart, enable recording mode and optionally fullscreen, then start playback. Pointer controls disappear after 2.4 seconds; moving the pointer or focusing a control reveals them. Space toggles playback when focus is outside controls; Escape leaves recording mode. Record the browser with your screen recorder. This version does not generate a video file or audio. Playback pauses when the tab is hidden.

## Model and rendering

`model/timeline.ts` derives chapter and progress from absolute film time. `model/renderer.ts` projects deterministic geometry onto Canvas 2D, without a 3D dependency. Seeking and replaying the same timestamp reproduce the same frame. Playback begins paused, including for reduced-motion users. The canvas resolution is capped at twice the CSS dimensions.

Token boundaries, IDs, vectors, attention weights and probabilities are illustrative. The layer grid represents repeated transformations, not individual biological neurons or the actual architecture of a named model. Only causal attention connections are shown. The final answer uses word-sized illustrative chunks; it is scripted and does not claim to run inference. The probability example sums to 100 percent. No network/model request is made by the film.

## Checks

`npm run check` at the workspace root checks all apps. App-specific deterministic timeline tests live in `tests/timeline.test.ts`. Browser QA covers chapter navigation, seeking, playback/end/replay, language switching, recording controls and a 390px mobile viewport.
