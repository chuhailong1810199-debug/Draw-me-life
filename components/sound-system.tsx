'use client';

import { useEffect, useRef, useState } from 'react';

type SoundEffect =
  | 'type'
  | 'line-complete'
  | 'line_complete'
  | 'next'
  | 'back'
  | 'restart'
  | 'complete'
  | 'choice';

const SOUND_CONFIG: Record<
  Exclude<SoundEffect, 'line_complete' | 'choice'>,
  { src: string; volume: number }
> = {
  type: { src: '/sounds/type.wav', volume: 0.035 },
  'line-complete': { src: '/sounds/line-complete.wav', volume: 0.08 },
  next: { src: '/sounds/next.wav', volume: 0.12 },
  back: { src: '/sounds/back.wav', volume: 0.1 },
  restart: { src: '/sounds/restart.wav', volume: 0.12 },
  complete: { src: '/sounds/complete.wav', volume: 0.2 },
};

const normalizeEffect = (effect: SoundEffect) => {
  if (effect === 'line_complete') {
    return 'line-complete';
  }

  if (effect === 'choice') {
    return 'next';
  }

  return effect;
};

export default function SoundSystem() {
  const [isMuted, setIsMuted] = useState(false);
  const audioMapRef = useRef<Partial<Record<keyof typeof SOUND_CONFIG, HTMLAudioElement>>>({});
  const isUnlockedRef = useRef(false);
  const isMutedRef = useRef(false);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem('pixel-story-muted');
    const shouldMute = savedPreference === 'true';

    setIsMuted(shouldMute);
    isMutedRef.current = shouldMute;

    audioMapRef.current = Object.entries(SOUND_CONFIG).reduce<
      Partial<Record<keyof typeof SOUND_CONFIG, HTMLAudioElement>>
    >((audioMap, [effect, config]) => {
      const audio = new Audio(config.src);
      audio.preload = 'auto';
      audio.volume = config.volume;
      audioMap[effect as keyof typeof SOUND_CONFIG] = audio;
      return audioMap;
    }, {});
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
    window.localStorage.setItem('pixel-story-muted', String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    const unlockAudio = () => {
      isUnlockedRef.current = true;
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const handleSound = (event: Event) => {
      const soundEvent = event as CustomEvent<{ effect?: SoundEffect }>;
      const effect = soundEvent.detail?.effect;

      if (!effect || !isUnlockedRef.current || isMutedRef.current) {
        return;
      }

      const normalizedEffect = normalizeEffect(effect);
      const audio = audioMapRef.current[normalizedEffect];

      if (!audio) {
        return;
      }

      audio.currentTime = 0;
      audio.play().catch(() => {
        // Missing files or blocked playback should never interrupt the story UI.
      });
    };

    window.addEventListener('pixel-story:sound', handleSound);
    return () => window.removeEventListener('pixel-story:sound', handleSound);
  }, []);

  const toggleMute = () => {
    setIsMuted((currentMuted) => !currentMuted);
  };

  return (
    <button
      type="button"
      onClick={toggleMute}
      className="pixel-panel pixel-text-wrap fixed right-4 top-4 z-50 rounded border-2 border-amber-500 bg-slate-950/85 px-3 py-2 font-mono text-xs text-amber-300 transition-colors hover:bg-slate-900"
      aria-pressed={isMuted}
      aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
    >
      {isMuted ? 'SOUND OFF' : 'SOUND ON'}
    </button>
  );
}
