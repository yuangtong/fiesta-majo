import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Application } from '@splinetool/runtime';

const hasWebGL = () => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

// Escena 3D de Spline (letras globo). Carga el runtime solo cuando hace falta (es pesado),
// pone el fondo transparente y oculta el texto de ayuda "Drag any balloon…".
// Si no hay WebGL, falla o tarda demasiado, muestra `fallback`.
export function SplineScene({ scene, fallback, className = '', onReady, timeoutMs = 12000 }: {
  scene: string;
  fallback: ReactNode;
  className?: string;
  onReady?: (app: Application) => void;
  timeoutMs?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>(() => (hasWebGL() ? 'loading' : 'failed'));

  useEffect(() => {
    if (state === 'failed' || !canvasRef.current) return;
    let app: Application | null = null;
    let done = false;
    const timer = setTimeout(() => { if (!done) setState('failed'); }, timeoutMs);

    import('@splinetool/runtime')
      .then(({ Application }) => {
        app = new Application(canvasRef.current!);
        return app.load(scene);
      })
      .then(() => {
        if (!app) return;
        done = true;
        clearTimeout(timer);
        app.setBackgroundColor('rgba(0,0,0,0)');
        const hint = app.findObjectByName('Hint');
        if (hint) hint.visible = false;
        setState('ready');
        onReady?.(app);
      })
      .catch(() => { done = true; clearTimeout(timer); setState('failed'); });

    return () => { clearTimeout(timer); app?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <div className={`relative ${className}`}>
      {state !== 'ready' && <div className="absolute inset-0 grid place-items-center">{fallback}</div>}
      {state !== 'failed' && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full transition-opacity duration-500"
          style={{ opacity: state === 'ready' ? 1 : 0, touchAction: 'pan-y' }}
        />
      )}
    </div>
  );
}
