import { useCallback, useRef, useState } from 'react';
import { config } from '../config';
import { setMuted, unlockAudio } from '../lib/sfx';

/** Música de fondo opcional (config.musica) + silencio global para los efectos. */
export function useAudio() {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(true);

  const start = useCallback(() => {
    unlockAudio();
    if (!config.musica) return;
    musicRef.current ??= Object.assign(new Audio(config.musica), { loop: true, volume: 0.35 });
    musicRef.current.play().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setMuted(!next);
      if (musicRef.current) {
        if (next) musicRef.current.play().catch(() => {});
        else musicRef.current.pause();
      }
      return next;
    });
  }, []);

  return { enabled, start, toggle };
}
