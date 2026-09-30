const SAMPLE_RATE = 44100;
const DURATION = 60;
const BEAT = 60 / 140;

/** Synthesizes an original 140 BPM breakbeat and bass hook directly into a stereo buffer. */
export async function renderSoundtrack(): Promise<AudioBuffer> {
    const buffer = new AudioBuffer({numberOfChannels: 2, length: SAMPLE_RATE * DURATION, sampleRate: SAMPLE_RATE});
    const left = buffer.getChannelData(0), right = buffer.getChannelData(1);
    let seed = 7127;
    function add(start: number, duration: number, volume: number, kind: "kick" | "snare" | "hat" | "bass" | "lead", midi = 69, pan = 0) {
        const first = Math.round(start * SAMPLE_RATE);
        const count = Math.min(Math.round(duration * SAMPLE_RATE), left.length - first);
        const frequency = 440 * 2 ** ((midi - 69) / 12);
        for (let i = 0; i < count; i++) {
            const t = i / SAMPLE_RATE;
            let sample: number;
            if (kind === "kick") {
                const phase = 2 * Math.PI * (45 * t + 120 * 0.025 * (1 - Math.exp(-t / 0.025)));
                sample = Math.sin(phase) * Math.exp(-t * 18);
            } else if (kind === "hat" || kind === "snare") {
                seed = (seed * 16807) % 2147483647;
                const noise = seed / 2147483647 * 2 - 1;
                sample = kind === "hat" ? noise * Math.sin(t * 47000) * Math.exp(-t * 75) : (noise * 0.75 + Math.sin(t * 2 * Math.PI * 180) * 0.25) * Math.exp(-t * 27);
            } else {
                const phase = 2 * Math.PI * frequency * t;
                const harmonics = kind === "bass" ? Math.sin(phase) + 0.3 * Math.sin(phase * 2) : Math.sin(phase) + 0.32 * Math.sin(phase * 3) + 0.12 * Math.sin(phase * 5);
                sample = harmonics * Math.min(1, t / 0.004) * Math.exp(-t * (kind === "bass" ? 14 : 18));
            }
            left[first + i] += sample * volume * (1 - pan * 0.5);
            right[first + i] += sample * volume * (1 + pan * 0.5);
        }
    }
    const hook = [69, 69, 76, 72, 69, 67, 72, 76, 81, 76, 72, 67, 69, 72, 67, 64];
    const roots = [33, 29, 36, 31];
    for (let step = 0; step * BEAT / 2 < DURATION; step++) {
        const start = step * BEAT / 2;
        const root = roots[Math.floor(step / 16) % 4];
        const breakdown = start >= 34 && start < 40;
        if (!breakdown && [0, 3, 4, 6].includes(step % 8)) add(start, 0.32, 0.85, "kick");
        if (!breakdown && step % 4 === 2) add(start, 0.18, 0.45, "snare");
        add(start, 0.09, breakdown ? 0.04 : 0.14, "hat", 69, step % 2 ? 0.35 : -0.35);
        if (!breakdown) add(start + 0.035, 0.2, 0.4, "bass", root + (step % 8 === 7 ? 12 : 0));
        if (step % 8 !== 5 && step % 8 !== 7) {
            const note = hook[step % 16] + root - 33;
            add(start, 0.22, breakdown ? 0.1 : 0.2, "lead", note, -0.1);
            add(start + BEAT * 0.75, 0.2, 0.055, "lead", note + 12, 0.4);
        }
        if (step % 32 === 31 && !breakdown) for (let roll = 1; roll < 4; roll++) add(start + roll * BEAT / 8, 0.05, 0.13, "snare");
    }
    for (let i = 0; i < left.length; i++) {
        const fade = Math.min(1, (left.length - i) / (SAMPLE_RATE * 2));
        left[i] = Math.tanh(left[i]) * 0.8 * fade;
        right[i] = Math.tanh(right[i]) * 0.8 * fade;
    }
    return buffer;
}
