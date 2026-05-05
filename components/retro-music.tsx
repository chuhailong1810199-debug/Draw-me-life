'use client';

import { useEffect, useRef } from 'react';

const BEACH_MUSIC_SRC = '/sounds/8-bit-beach-adventure.mp3';

export default function RetroMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(BEACH_MUSIC_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.28;
    audioRef.current = audio;

    const startMusic = () => {
      audio.play().catch(() => {
        // Browser autoplay rules or missing files should never block the story UI.
      });
    };

    window.addEventListener('pointerdown', startMusic, { once: true });
    window.addEventListener('keydown', startMusic, { once: true });

    return () => {
      window.removeEventListener('pointerdown', startMusic);
      window.removeEventListener('keydown', startMusic);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  return null;
}
