import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { plasticine, prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

gsap.registerPlugin(Draggable);

/** x/y en % de la pantalla; size = ancho en px en un celular (crece en pantallas grandes). */
export interface Floaty { img: string; x: string; y: string; size: number; rot?: number }

// Juguetes alrededor del contenido: entran rebotando, se balancean despacio y se pueden arrastrar.
// Con `wander`, además pasean lentamente por toda la pantalla (como las nubes) y retoman el paseo al soltarlos.
// El contenedor no recibe toques (deja pasar a las nubes y al contenido); solo los juguetes.
export function Floaties({ items, wander = false }: { items: Floaty[]; wander?: boolean }) {
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
        gsap.from(inner, { scale: 0, rotation: -40, duration: 1, delay: 0.15 + i * 0.08, ease: 'elastic.out(1, 0.45)' });
        gsap.to(inner, { y: i % 2 ? 12 : -12, rotation: i % 2 ? 7 : -7, duration: 4 + (i % 3) * 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
        gsap.delayedCall(1.5 + gsap.utils.random(0, 2), () => walk(el));
      });
      Draggable.create(toys, {
        bounds: window,
        zIndexBoost: true,
        onPress() {
          walks.get(this.target)?.kill();
          squeak();
          if (!reduced) gsap.to(this.target, { scale: 1.15, duration: 0.25, ease: 'back.out(3)' });
        },
        onRelease() {
          if (!reduced) gsap.to(this.target, { scale: 1, duration: 0.7, ease: 'elastic.out(1.2, 0.35)' });
          const target = this.target as HTMLElement;
          gsap.delayedCall(2, () => walk(target));
        },
      });
    }, ref);
    return () => { walks.forEach((t) => t.kill()); ctx.revert(); };
  }, [wander]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-20">
      {items.map((it, i) => (
        <div
          key={i}
          className="toy pointer-events-auto absolute cursor-grab touch-none select-none active:cursor-grabbing"
          style={{ left: it.x, top: it.y, width: `clamp(${it.size}px, ${(it.size / 390) * 100}vw, ${it.size * 1.7}px)` }}
        >
          <span className="block" style={{ transform: `rotate(${it.rot ?? 0}deg)` }}>
            <img src={plasticine(it.img)} alt="" draggable={false} className="w-full drop-shadow-[0_14px_18px_rgba(10,31,68,0.22)]" />
          </span>
        </div>
      ))}
    </div>
  );
}
