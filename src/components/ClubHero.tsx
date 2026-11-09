import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ChevronDown } from 'lucide-react';
import { config } from '../config';
import { plasticine, prefersReducedMotion } from '../lib/motion';
import { pop, puff, squeak } from '../lib/sfx';

gsap.registerPlugin(Draggable);

// Escena "Huamanga Club · Vol 0." con entrada de cine:
// franjas negras (letterbox) → la cámara empieza pegada al título y hace zoom out con desenfoque de foco
// → los globos entran desde fuera de cuadro en capas (los de adelante se mueven más) → se abren las franjas.
// Horizontal: la composición generada tal cual. Vertical (celular): la misma idea armada por capas.

/** Piezas de la versión vertical: x/y/w en % del cuadro; depth = cuánto "viene de la cámara" al entrar. */
const MOBILE_TOYS = [
  { img: 'globos/flor', x: -10, y: 4, w: 40, rot: -12, depth: 1.6 },
  { img: 'nature-butterfly', x: 66, y: 5, w: 34, rot: 10, depth: 1.4 },
  { img: 'shapes-hearts', x: 4, y: 49, w: 22, rot: -8, depth: 1.2 },
  { img: 'nature-star', x: 78, y: 48, w: 22, rot: 14, depth: 1.2 },
  { img: 'globos/perrito', x: -6, y: 63, w: 50, rot: 0, depth: 1.8 },
  { img: 'globos/flor', x: 66, y: 70, w: 36, rot: 18, depth: 1.6 },
  { img: 'nature-clouds', x: 34, y: 82, w: 36, rot: 0, depth: 1.1 },
];

const useWide = () => {
  const q = '(min-aspect-ratio: 5/4)';
  const [wide, setWide] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
};

export function ClubHero({ onScrollHint }: { onScrollHint: () => void }) {
  const wide = useWide();
  const rootRef = useRef<HTMLDivElement>(null);
  const t = config.titulos;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const camera = root.querySelector('.camera')!;
      const toys = gsap.utils.toArray<HTMLElement>('.htoy');

      Draggable.create(toys, {
        zIndexBoost: true,
        onPress() { squeak(); gsap.to(this.target, { scale: 1.12, duration: 0.2 }); },
        onRelease() { gsap.to(this.target, { scale: 1, duration: 0.7, ease: 'elastic.out(1.2, 0.35)' }); },
      });

      if (reduced) { gsap.set('.bar', { scaleY: 0 }); gsap.set('.cue', { opacity: 1 }); return; }

      // Medir dónde está cada globo ANTES de mover la cámara
      const offsets = toys.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 };
      });

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      tl.set('.bar', { scaleY: 1 })
        .fromTo(camera, { scale: 2.8, filter: 'blur(14px)' }, { scale: 1, filter: 'blur(0px)', duration: 2.6, ease: 'expo.inOut' }, 0.15)
        .fromTo('.htitle', { y: 18 }, { y: 0, duration: 2.6, ease: 'expo.inOut' }, 0.15);

      // Capas: cada globo llega desde fuera de cuadro; los "más cerca de la cámara" se mueven más.
      toys.forEach((el, i) => {
        const depth = Number(el.dataset.depth || 1.3);
        const { x: cx, y: cy } = offsets[i];
        const at = 1.35 + i * 0.09;
        tl.fromTo(el.firstElementChild, { x: cx * depth, y: cy * depth, scale: depth * 1.4, opacity: 0, filter: 'blur(8px)' }, {
          x: 0, y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.3, ease: 'power3.out',
        }, at);
        tl.add(() => puff(), at + 0.1);
      });

      tl.fromTo('.vol', { scale: 0, rotation: -25 }, { scale: 1, rotation: -4, duration: 1, ease: 'elastic.out(1, 0.45)' }, 2.5)
        .add(() => pop(), 2.55)
        .to('.bar', { scaleY: 0, duration: 1, ease: 'power3.inOut' }, 2.4)
        .fromTo('.cue', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6 }, 3.2);

      // Después: la cámara "respira" (Ken Burns) y los globos flotan.
      tl.add(() => {
        gsap.to(camera, { scale: wide ? 1.015 : 1.03, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        toys.forEach((el, i) => gsap.to(el.firstElementChild, {
          y: i % 2 ? 10 : -10, rotation: i % 2 ? 4 : -4, duration: 2.6 + (i % 3) * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1,
        }));
      });

      // Paralaje sutil con el mouse (computadora)
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        gsap.to('.parallax', { x: dx * -12, y: dy * -8, duration: 1.2, ease: 'power2.out' });
      };
      window.addEventListener('pointermove', onMove);
      return () => window.removeEventListener('pointermove', onMove);
    }, root);
    return () => ctx.revert();
  }, [wide]);

  return (
    <section ref={rootRef} className="relative h-[100svh] w-full overflow-hidden" aria-label={`${config.evento.marca} ${config.evento.vol}`}>
      <div className="parallax absolute inset-[-14px]">
        <div className="camera absolute inset-0 origin-[50%_44%]">
          {wide && t.clubEscena ? (
            <img src={t.clubEscena} alt={`${config.evento.marca} ${config.evento.vol}`} className="htitle h-full w-full object-cover" draggable={false} />
          ) : (
            <>
              {MOBILE_TOYS.map((toy, i) => (
                <div
                  key={i}
                  data-depth={toy.depth}
                  aria-hidden
                  className="htoy absolute cursor-grab touch-none select-none"
                  style={{ left: `${toy.x}%`, top: `${toy.y}%`, width: `${toy.w}%` }}
                >
                  <img src={plasticine(toy.img)} alt="" draggable={false} className="w-full drop-shadow-[0_16px_22px_rgba(10,31,68,0.22)]" style={{ transform: `rotate(${toy.rot}deg)` }} />
                </div>
              ))}
              <div className="htitle absolute inset-x-0 top-[24%] mx-auto w-[78%] max-w-[520px]">
                <img src={t.club} alt={config.evento.marca} draggable={false} className="w-full drop-shadow-[0_24px_30px_rgba(10,31,68,0.28)]" />
                <span className="vol text-balloon-black absolute -bottom-[9%] right-[2%] origin-left font-display text-[clamp(28px,9vw,52px)]">
                  {config.evento.vol}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Franjas de cine */}
      <div aria-hidden className="bar pointer-events-none absolute inset-x-0 top-0 z-30 h-[12vh] origin-top scale-y-0 bg-black" />
      <div aria-hidden className="bar pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[12vh] origin-bottom scale-y-0 bg-black" />

      <button onClick={onScrollHint} className="cue btn-ghost absolute bottom-6 left-1/2 z-20 -translate-x-1/2 opacity-0">
        Ver el line-up <ChevronDown size={18} className="animate-bounce" />
      </button>
    </section>
  );
}
