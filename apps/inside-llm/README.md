# Inside a Language Model

A continuous, abstract input-to-output scene in Oskar Lab at `/apps/inside-llm` (port 10039). It uses 2,400 seeded particles, nine transformer-inspired structures, five colors, flowing signal ribbons and a next-token distribution. Each structure contains three attention-inspired groups and connected feed-forward nodes. Activation values sit beside individual nodes. Headings, tokens and output text occupy world-space XY planes and inherit camera scale, roll and perspective. Five prompt tokens follow deterministic routes through attention and feed-forward columns, with active edges and nodes highlighted. Dense inter-block connections join the feed-forward outputs to the following attention inputs. The camera follows a 60-second route from the whole model through its layers and back. Camera looping is on by default and can be disabled with the infinity button.

## Run and record

From the frontend workspace, run `npm run dev:app -- inside-llm` and `npm run dev:app -- oskar-lab`. Open `http://localhost:10030/apps/inside-llm`. Standalone mode: `npm run dev:app -- inside-llm --standalone`.

Enable recording mode, optionally fullscreen, and start the scene. Controls and the cursor hide after 2.4 seconds without pointer activity. Space toggles playback outside controls; Escape exits recording mode. Choose camera positions or scrub freely. The scene starts paused and pauses when the browser tab is hidden. Record with a screen recorder including browser/system audio. The original electronic soundtrack is synthesized locally using Web Audio on the first play gesture; music and volume controls are provided. It pauses and resynchronizes on seeking, speed changes and looping. No video export is included.

## Rendering and meaning

`model/choreography.ts` defines the stable model geometry, moving particles and smooth camera keyframes. `model/renderer.ts` projects the scene into Canvas 2D with additive glow sprites and signal trails. Every frame is derived from absolute time, so seeking is reproducible. Canvas resolution is capped at twice the display size.

This is an artistic interpretation of computation, not an architectural diagram or inference trace. The prompt and output captions are scripted; there is no AI backend. The example prompt is “How is the weather?” (German: “Wie ist das Wetter?”). Four illustrative candidate probabilities sum to 100 percent; the prepared answer is “It is sunny.” / “Es ist sonnig.” This does not access weather data. Intermediate layers transform representations; they do not independently decide output words. Signed activation values update twice per second and repeat deterministically. Connections and the reduced node counts are visual abstractions, not the architecture or weights of a named model. The recording surface explicitly identifies the values as illustrative.

## Validation

Run `npm run check` in the workspace. App tests cover timeline boundaries, finite particle geometry, input-to-output ordering and the camera's return to its initial pose. Browser checks cover playback, seeking, loop controls, recording mode and mobile layout.
