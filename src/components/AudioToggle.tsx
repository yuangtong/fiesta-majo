import { Volume2, VolumeX } from 'lucide-react';

export function AudioToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={enabled ? 'Silenciar sonido' : 'Activar sonido'}
      className="absolute right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-ink backdrop-blur"
    >
      {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}
