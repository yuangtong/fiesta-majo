import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { plasticine, prefersReducedMotion } from '../lib/motion';

export interface Floaty { img: string; x: string; y: string; size: number; rot?: number }

// Objetos de plastilina que flotan despacio alrededor del contenido (decoración).
export function Floaties({ items }: { items: Floaty[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.floaty').forEach((el, i) => {
        gsap.fromTo(el, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.9, delay: 0.1 + i * 0.07, ease: 'back.out(2)' });
        gsap.to(el, { y: '+=14', rotation: `+=${i % 2 ? 8 : -8}`, duration: 2.6 + (i % 3) * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <img
          key={i}
          src={plasticine(it.img)}
          alt=""
          className="floaty absolute drop-shadow-[0_10px_14px_rgba(10,31,68,0.18)]"
          style={{ left: it.x, top: it.y, width: it.size, transform: `rotate(${it.rot ?? 0}deg)` }}
        />
      ))}
    </div>
  );
}
