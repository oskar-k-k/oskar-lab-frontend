/** Synthesizes an original sixty-second electronic score locally, without downloaded music. */
export async function renderSoundtrack(): Promise<AudioBuffer> {
    const context = new OfflineAudioContext(2, 60 * 44100, 44100);
    const master = context.createGain();
    master.gain.value = 0.5;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.ratio.value = 5;
    master.connect(compressor).connect(context.destination);
    const echo = context.createDelay(1);
    echo.delayTime.value = 0.375;
    const echoGain = context.createGain();
    echoGain.gain.value = 0.2;
    echo.connect(echoGain).connect(master);

    function tone(frequency: number, start: number, duration: number, volume: number, type: OscillatorType, pan = 0) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const panner = context.createStereoPanner();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        panner.pan.value = pan;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, Math.min(60, start + duration));
        oscillator.connect(gain).connect(panner).connect(master);
        if (type === "sine" && frequency > 200) panner.connect(echo);
        oscillator.start(start);
        oscillator.stop(Math.min(60, start + duration + 0.02));
    }

    const chords = [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]];
    const frequency = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
    for (let beat = 0; beat < 120; beat++) {
        const time = beat * 0.5;
        const chord = chords[Math.floor(beat / 16) % chords.length];
        const fade = Math.min(1, (60 - time) / 2);
        const kick = context.createOscillator();
        const gain = context.createGain();
        kick.frequency.setValueAtTime(130, time);
        kick.frequency.exponentialRampToValueAtTime(42, time + 0.18);
        gain.gain.setValueAtTime(0.28 * fade, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
        kick.connect(gain).connect(master);
        kick.start(time); kick.stop(time + 0.3);
        tone(frequency(chord[0] - 12), time + 0.02, 0.4, 0.17 * fade, "triangle");
        for (let subdivision = 0; subdivision < 2; subdivision++) {
            const start = time + subdivision * 0.25;
            const note = chord[(beat + subdivision) % 4] + 24;
            tone(frequency(note), start, Math.min(0.55, 60 - start), 0.075 * fade, "sine", subdivision === 0 ? -0.4 : 0.4);
        }
        if (beat % 8 === 0) {
            chord.forEach((note, index) => tone(frequency(note + 12), time, Math.min(3.8, 60 - time), 0.026 * fade, "sine", (index - 1.5) / 3));
        }
    }
    return context.startRendering();
}
