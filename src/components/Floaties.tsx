import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion, toyImg } from '../lib/motion';
import { makeThrowable } from '../lib/drag';

/** x/y en % de la pantalla; size = ancho en px en un celular (crece en pantallas grandes). */
export interface Floaty { img: string; x: string; y: string; size: number; rot?: number }

// Juguetes alrededor del contenido: entran rebotando, se balancean despacio y se pueden arrastrar.
// Con `wander`, además pasean lentamente por toda la pantalla (como las nubes) y retoman el paseo al soltarlos.
// Van DETRÁS del contenido (se agarran tocando un espacio vacío, ver installPassthrough) y pasan adelante al arrastrarlos.
export function Floaties({ items, wander = false, enterFrom }: {
  items: Floaty[];
  wander?: boolean;
  /** Punto de la pantalla (px) desde donde salen volando al aparecer (ej. el centro del sobre) */
  enterFrom?: { x: number; y: number } | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const reduced = prefersReducedMotion();
    const walks = new Map<HTMLElement, gsap.core.Tween>();

    // Paseo: el juguete va a un punto al azar de la pantalla (puede asomarse por los bordes) y repite.
    const walk = (el: HTMLElement) => {
      if (reduced || !wander) return;
      const r = el.getBoundingClientRect();
      const x0 = r.left - Number(gsap.getProperty(el, 'x'));
      const y0 = r.top - Number(gsap.getProperty(el, 'y'));
      const tween = gsap.to(el, {
        x: gsap.utils.random(-x0 - r.width * 0.3, window.innerWidth - x0 - r.width * 0.7),
        y: gsap.utils.random(-y0 - r.height * 0.3, window.innerHeight - y0 - r.height * 0.7),
        duration: gsap.utils.random(40, 70),
        ease: 'sine.inOut',
        onComplete: () => walk(el),
      });
      walks.set(el, tween);
    };

    const ctx = gsap.context(() => {
      const toys = gsap.utils.toArray<HTMLElement>('.toy');
      toys.forEach((el, i) => {
        const inner = el.firstElementChild as HTMLElement;
        if (reduced) return;
        if (enterFrom) {
          // Sale disparado desde el punto de origen hasta su lugar
          const r = el.getBoundingClientRect();
          gsap.from(el, {
            x: enterFrom.x - (r.left + r.width / 2), y: enterFrom.y - (r.top + r.height / 2),
            scale: 0.15, rotation: gsap.utils.random(-90, 90), duration: 1.1, delay: i * 0.05, ease: 'back.out(1.4)',
          });
        } else {
          gsap.from(inner, { scale: 0, rotation: -40, duration: 1, delay: 0.15 + i * 0.08, ease: 'elastic.out(1, 0.45)' });
        }
        gsap.to(inner, { y: i % 2 ? 12 : -12, rotation: i % 2 ? 7 : -7, duration: 4 + (i % 3) * 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
        gsap.delayedCall(1.5 + gsap.utils.random(0, 2), () => walk(el));
      });
      // Física al soltar. Los juguetes viven detrás del texto; al agarrarlos pasan adelante.
      makeThrowable(toys, {
        bounds: window,
        onGrab: (el) => { walks.get(el)?.kill(); if (ref.current) ref.current.style.zIndex = '40'; },
        onRest: (el) => {
          if (ref.current) ref.current.style.zIndex = '';
          gsap.delayedCall(2, () => walk(el));
        },
      });
    }, ref);
    return () => { walks.forEach((t) => t.kill()); ctx.revert(); };
  }, [wander]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[-1]">
      {items.map((it, i) => (
        <div
          key={i}
          className="toy pointer-events-auto absolute cursor-grab touch-none select-none will-change-transform active:cursor-grabbing"
          style={{ left: it.x, top: it.y, width: `clamp(${it.size}px, ${(it.size / 390) * 100}vw, ${it.size * 1.7}px)` }}
        >
          <span className="block" style={{ transform: `rotate(${it.rot ?? 0}deg)` }}>
            <img {...toyImg(it.img, `(min-width: 768px) ${Math.round(it.size * 1.7)}px, ${it.size}px`)} alt="" draggable={false} className="w-full drop-shadow-[0_14px_18px_rgba(10,31,68,0.22)]" />
          </span>
        </div>
      ))}
    </div>
  );
}
