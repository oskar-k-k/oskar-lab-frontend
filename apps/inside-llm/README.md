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
