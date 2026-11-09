import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

gsap.registerPlugin(Draggable);

// Nubes infladas sobre el degradado del cielo (body). Flotan solas y se pueden arrastrar con el dedo
// o el mouse; al soltarlas se quedan donde las dejaste. Posiciones basadas en el fondo generado.
const CLOUDS = [
  { x: -6, y: 2, w: 42, flip: false },
  { x: 64, y: 8, w: 34, flip: true },
  { x: 84, y: 2, w: 14, flip: false },
  { x: 2, y: 23, w: 17, flip: true },
  { x: 83, y: 28, w: 22, flip: false },
  { x: 1, y: 64, w: 16, flip: false },
  { x: 79, y: 70, w: 19, flip: true },
  { x: -8, y: 78, w: 44, flip: true },
  { x: 64, y: 80, w: 44, flip: false },
];

export function Sky() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const clouds = gsap.utils.toArray<HTMLElement>('.cloud');
      if (!reduced) {
        gsap.from(clouds, { scale: 0, duration: 1, ease: 'elastic.out(1, 0.5)', stagger: 0.06 });
        clouds.forEach((el, i) => {
          gsap.to(el.querySelector('img'), {
            y: i % 2 ? 10 : -10, x: i % 3 ? 6 : -6, duration: 3 + (i % 4) * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1,
          });
        });
      }
      Draggable.create(clouds, {
        bounds: ref.current,
        zIndexBoost: false,
        onPress() {
          squeak();
          if (!reduced) gsap.to(this.target, { scale: 1.08, duration: 0.25, ease: 'back.out(3)' });
        },
        onRelease() {
          if (!reduced) gsap.to(this.target, { scale: 1, duration: 0.6, ease: 'elastic.out(1.1, 0.4)' });
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          aria-hidden
          className="cloud absolute cursor-grab touch-none select-none active:cursor-grabbing"
          style={{ left: `${c.x}%`, top: `${c.y}%`, width: `clamp(${c.w * 2.4}px, ${c.w}vw, ${c.w * 9}px)` }}
        >
          <img
            src="/images/fondo/nube.webp"
            alt=""
            draggable={false}
            className="w-full drop-shadow-[0_12px_20px_rgba(10,31,68,0.12)]"
            style={{ transform: c.flip ? 'scaleX(-1)' : undefined }}
          />
        </div>
      ))}
    </div>
  );
}
