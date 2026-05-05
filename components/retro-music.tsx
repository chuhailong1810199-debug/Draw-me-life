'use client';

import { useEffect, useRef } from 'react';

const BPM = 138;
const SIXTEENTH = (60 / BPM) / 4;

// C pentatonic major scale frequencies (two octaves)
const S = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00, // A5
];

// [scale_idx | -1 rest, duration_in_16ths]
const MELODY: [number, number][] = [
  // bar 1 — opening run
  [7, 1], [5, 1], [6, 1], [7, 1],
  // bar 2
  [5, 2], [3, 1], [4, 1],
  [6, 1], [5, 1], [4, 1], [5, 1],
  // bar 3
  [3, 2], [2, 1], [1, 1],
  // bar 4 — build
  [3, 1], [4, 1], [5, 1], [6, 1],
  [7, 2], [6, 1], [5, 1],
  // bar 5
  [4, 1], [3, 1], [2, 1], [1, 1],
  // bar 6 — resolve
  [0, 4],
  // bar 7 — second phrase
  [5, 1], [7, 1], [8, 2],
  [7, 1], [5, 1], [6, 2],
  // bar 8
  [5, 1], [3, 1], [4, 1], [5, 1],
  [7, 2], [5, 2],
  // bar 9 — variation
  [8, 1], [7, 1], [5, 1], [6, 1],
  [7, 2], [5, 1], [4, 1],
  // bar 10
  [3, 1], [4, 1], [5, 1], [4, 1],
  [3, 2], [1, 1], [2, 1],
  // bar 11 — climax
  [5, 1], [6, 1], [7, 1], [8, 1],
  [9, 2], [8, 1], [7, 1],
  // bar 12 — return
  [5, 1], [4, 1], [3, 1], [2, 1],
  [0, 4],
];

// Bass line: uses lower frequencies (C3 range)
const BASS_FREQS: Record<number, number> = {
  0: 65.41,  // C2
  1: 73.42,  // D2
  2: 82.41,  // E2
  3: 98.00,  // G2
  4: 110.00, // A2
  5: 130.81, // C3
};

const BASS: [number, number][] = [
  [0, 4], [-1, 2], [0, 2],
  [0, 4], [-1, 2], [0, 2],
  [1, 4], [-1, 2], [1, 2],
  [0, 4], [-1, 4],
  [3, 4], [-1, 2], [3, 2],
  [3, 4], [-1, 2], [3, 2],
  [4, 4], [-1, 2], [4, 2],
  [0, 4], [-1, 4],
  [0, 4], [-1, 2], [0, 2],
  [1, 4], [-1, 2], [1, 2],
  [3, 4], [-1, 2], [3, 2],
  [0, 4], [-1, 4],
];

function scheduleNote(
  ctx: AudioContext,
  gain: GainNode,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.12,
) {
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  noteGain.gain.setValueAtTime(0, startTime);
  noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  noteGain.gain.setValueAtTime(volume, startTime + duration - 0.04);
  noteGain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(noteGain);
  noteGain.connect(gain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

function scheduleLoop(ctx: AudioContext, masterGain: GainNode) {
  let t = ctx.currentTime + 0.05;

  for (const [idx, dur] of MELODY) {
    const duration = dur * SIXTEENTH;
    if (idx >= 0) {
      scheduleNote(ctx, masterGain, S[idx], t, duration, 'square', 0.10);
    }
    t += duration;
  }

  let bt = ctx.currentTime + 0.05;
  for (const [idx, dur] of BASS) {
    const duration = dur * SIXTEENTH;
    if (idx >= 0 && BASS_FREQS[idx]) {
      scheduleNote(ctx, masterGain, BASS_FREQS[idx], bt, duration, 'triangle', 0.07);
    }
    bt += duration;
  }

  return Math.max(t, bt);
}

export default function RetroMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);

  const stopMusic = () => {
    isPlayingRef.current = false;
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    if (masterGainRef.current && ctxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3);
    }
  };

  const playLoop = (ctx: AudioContext, gain: GainNode) => {
    if (!isPlayingRef.current) return;
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    const loopEnd = scheduleLoop(ctx, gain);
    const loopDuration = (loopEnd - ctx.currentTime) * 1000;
    loopTimerRef.current = setTimeout(() => playLoop(ctx, gain), loopDuration - 200);
  };

  const startMusic = () => {
    if (isPlayingRef.current) {
      return;
    }

    isPlayingRef.current = true;

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      const gain = ctxRef.current.createGain();
      gain.gain.setValueAtTime(1, ctxRef.current.currentTime);
      gain.connect(ctxRef.current.destination);
      masterGainRef.current = gain;
    }

    const ctx = ctxRef.current;
    const gain = masterGainRef.current!;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    gain.gain.setValueAtTime(1, ctx.currentTime);
    playLoop(ctx, gain);
  };

  useEffect(() => {
    const unlock = () => {
      startMusic();
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      stopMusic();
      ctxRef.current?.close().catch(() => {
        // Closing can fail if the context is already closed.
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
