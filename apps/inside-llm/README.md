# Inside a Language Model

A sixty-second recorded walkthrough at `/apps/inside-llm` (port 10039). The opening types a weather question into a chat composer and sends it. Tokens become bracketed numeric vectors. Four reduced transformer blocks alternate causal attention with independent per-token feed-forward networks. Residual bypasses and normalization accompany both sublayers. The final view shows Linear → Softmax → candidate probabilities, followed by a scripted request for a location.

## Run and record

From the frontend workspace, run `npm run dev:app -- inside-llm` and `npm run dev:app -- oskar-lab`. Open `http://localhost:10030/apps/inside-llm`. Standalone mode: `npm run dev:app -- inside-llm --standalone`.

Enable recording mode, optionally fullscreen, and start the scene. Controls hide after 2.4 seconds without pointer activity. Space toggles playback outside controls; Escape exits recording mode. Chapters and scrubbing are deterministic. The scene starts paused and pauses when its tab is hidden. Record browser/system audio to include the original locally synthesized 140 BPM electronic soundtrack with syncopated kick, snare, hats, bass, a repeating synth hook and a short breakdown. Music synchronizes with playback, seeking and speed. No video export is included.

## Rendering and meaning

`model/renderer.ts` projects a continuous 3D scene into Canvas 2D: translucent attention cuboids, spatial feed-forward neuron layers and camera-facing, world-anchored chat/output cards without surrounding cuboids, without stars, spirals, rings or additive glow. The oblique perspective camera travels outside repeated blocks and pulls back to a complete overview. All labels inherit their world-plane orientation. Curved bundles fan out from the prompt and converge at the output. Subtly swaying cubic cables stay anchored to neurons and carry moving signal pulses. Their motion depends only on film time, so pause and seeking remain deterministic. Deterministically scattered neurons and dense crossing connections fill the feed-forward volumes while retaining independent per-token networks. Canvas resolution is capped at twice display size.

`model/transformer.ts` computes a deterministic, untrained miniature example with six-component vectors, causal single-head attention (identity Q/K/V projections), residual additions, post-layer normalization and a shared 6 → 10 → 6 ReLU feed-forward network. Each stage's output supplies the next stage's numbers. It is an educational reduction, not a trained language model. Real models typically use multiple learned attention heads and much larger vectors. The word-aligned token boundaries are illustrative: actual tokenizers may split words. Input values stand in for combined embedding and position information.

The output probabilities and sentence are scripted and are not computed by this toy network. The response asks for the location; no weather data is accessed. Probability bars describe only the first output token and fade as subsequent scripted tokens appear. The recording surface labels values as illustrative.

## Validation

Run `npm run check` in the workspace. Transformer tests verify causal masking, normalized attention, independence from future tokens and finite, continuous representations between blocks. Legacy choreography tests remain for the earlier reusable scene model; the current renderer does not use that particle layout. Browser checks cover chat entry, vectors, feed-forward networks, output, playback, music and mobile controls.

## Resource overlay

The white recording overlay shows simulated counters from submission (3.4 s) to reference completion (59 s). The visible-text token estimates are 5 input / 6 output in English and 7 / 7 in German; they are assumptions, not tokenizer results. System context, history, tools and reasoning are omitted. The Qwen3-8B-scale operation estimate is 2 × 8.2B × (prefill tokens + max(output tokens − 1, 0)), with attention overhead omitted and cached decoding assumed. BF16 weight capacity remains fixed at 16.4 decimal GB, excluding runtime/cache memory.

Energy (0.24 Wh), cooling water (0.26 mL) and emissions (0.03 g CO2e) use Google's published median Gemini Apps text-prompt reference from May 2025. They are not Qwen measurements or predictions for the weather question. Their animated accumulation is an illustrative time stretch, not an observed consumption curve. Energy-only cost is 0.24 / 1000 × an assumed EUR 0.30/kWh = EUR 0.000072; it is not API pricing. The source/assumptions disclosure is localized and accessible below the player, hidden in recording mode.

Sources checked 2026-09-30:
- https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference
- https://huggingface.co/Qwen/Qwen3-8B
- https://neurips2023-enlsp.github.io/papers/paper_75.pdf

## Rendering performance

The playhead publishes directly from requestAnimationFrame to the canvas. React transport and audio synchronization update at 10 Hz; seeking remains immediate. One persistent ResizeObserver updates cached backing dimensions, avoiding repeated observer installation and duplicate drawing. Labels, neuron geometry, camera trigonometry and sphere sprites are reused. Cable paths are batched by style, and each curved fan/attention arc is stroked once instead of once per segment. Node counts, edge counts, animation and the existing device-pixel-ratio cap are retained.

Canvas data attributes expose `data-render-ms`, `data-mean-render-ms` and `data-frame-fps` for local diagnostics. The latter averages 60 rendered frames and is not a GPU presentation guarantee. Browser scheduling, screen refresh and recording software can still limit actual delivered frame rate.

Dense moving cables and attention/fan curves additionally use an optional WebGL layer with a single buffered draw call. The text/box layer remains Canvas 2D at unchanged resolution. WebGL loss switches immediately to the Canvas path and restoration rebuilds GPU resources. No network edges or neurons are removed. GPU line tessellation uses sixteen segments per cubic cable; this changes rasterization rather than model detail.
