import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

gsap.registerPlugin(Draggable);

// Nubes infladas sobre el degradado del cielo (body).
// Viajan despacio y al azar por toda la pantalla; se pueden arrastrar y, al soltarlas, siguen su paseo.
// Posición inicial (en % del viewport) y ancho (vw) basados en el fondo generado.
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

const widthPx = (w: number) => Math.min(Math.max(w * 2.4, (w / 100) * window.innerWidth), w * 9);

export function Sky() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    const wanders = new Map<HTMLElement, gsap.core.Tween>();
    const cleanup: (() => void)[] = [];

    // Paseo: va a un punto al azar dentro de la pantalla (puede asomarse un poco por los bordes) y repite.
    const wander = (el: HTMLElement) => {
      if (reduced) return;
      const { width, height } = el.getBoundingClientRect();
      const tween = gsap.to(el, {
        x: gsap.utils.random(-width * 0.35, window.innerWidth - width * 0.65),
        y: gsap.utils.random(-height * 0.3, window.innerHeight - height * 0.7),
        duration: gsap.utils.random(18, 34),
        ease: 'sine.inOut',
        onComplete: () => wander(el),
      });
      wanders.set(el, tween);
    };

    const ctx = gsap.context(() => {
      const clouds = gsap.utils.toArray<HTMLElement>('.cloud');
      clouds.forEach((el, i) => {
        const c = CLOUDS[i];
        gsap.set(el, { width: widthPx(c.w), x: (c.x / 100) * window.innerWidth, y: (c.y / 100) * window.innerHeight });
        if (!reduced) {
          gsap.from(el.firstElementChild, { scale: 0, duration: 1, delay: i * 0.06, ease: 'elastic.out(1, 0.5)' });
          // balanceo suave, aparte del paseo
          gsap.to(el.firstElementChild, { rotation: i % 2 ? 3 : -3, y: i % 2 ? 6 : -6, duration: 2.6 + (i % 3) * 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          gsap.delayedCall(gsap.utils.random(0, 2.5), () => wander(el));
        }
      });

      const drags = Draggable.create(clouds, {
        zIndexBoost: false,
        onPress() {
          wanders.get(this.target)?.kill();
          squeak();
          if (!reduced) gsap.to(this.target.firstElementChild, { scale: 1.08, duration: 0.25, ease: 'back.out(3)' });
        },
        onRelease() {
          if (!reduced) gsap.to(this.target.firstElementChild, { scale: 1, duration: 0.6, ease: 'elastic.out(1.1, 0.4)' });
          gsap.delayedCall(1.5, () => wander(this.target));
        },
      });
      // La pantalla está encima de las nubes (para poder hacer scroll). Si el toque cae en un espacio vacío
      // de la pantalla y hay una nube debajo, se empieza a arrastrar esa nube.
      const isEmptySpot = (t: EventTarget | null) =>
        t instanceof HTMLElement && (t.hasAttribute('data-passthrough') || t.classList.contains('screen'));
      const onDown = (ev: MouseEvent | TouchEvent) => {
        if (!isEmptySpot(ev.target)) return;
        const p = 'touches' in ev ? ev.touches[0] : ev;
        const cloud = document.elementsFromPoint(p.clientX, p.clientY).find((el) => el.classList.contains('cloud'));
        const drag = cloud && drags.find((d) => d.target === cloud);
        if (!drag) return;
        ev.preventDefault();
        wanders.get(cloud as HTMLElement)?.kill();
        squeak();
        drag.startDrag(ev);
      };
      window.addEventListener('mousedown', onDown, true);
      window.addEventListener('touchstart', onDown, { capture: true, passive: false });
      cleanup.push(() => {
        window.removeEventListener('mousedown', onDown, true);
        window.removeEventListener('touchstart', onDown, true);
      });
    }, root);

    return () => { cleanup.forEach((f) => f()); wanders.forEach((t) => t.kill()); ctx.revert(); };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {CLOUDS.map((c, i) => (
        <div key={i} aria-hidden className="cloud absolute left-0 top-0 cursor-grab touch-none select-none active:cursor-grabbing">
          {/* el span recibe escala/balanceo; la imagen solo se voltea */}
          <span className="block">
            <img
              src="/images/fondo/nube.webp"
              alt=""
              draggable={false}
              className="w-full drop-shadow-[0_12px_20px_rgba(10,31,68,0.12)]"
              style={{ transform: c.flip ? 'scaleX(-1)' : undefined }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
