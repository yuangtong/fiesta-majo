import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
import { config } from '../config';
import { prefersReducedMotion, toyImg } from '../lib/motion';
import { pop, puff } from '../lib/sfx';

import { makeThrowable } from '../lib/drag';

// Escena "Huamanga Club · Vol 0." armada capa por capa (siguiendo la composición de referencia),
// con entrada de cine: franjas negras → la cámara empieza pegada al título, desenfocada, y hace zoom out
// → cada globo llega desde fuera de cuadro (los más cercanos a la cámara se mueven más) → se abren las franjas.
// Todas las piezas flotan y se pueden arrastrar.

interface Layer {
  img: string; // 'globos/flor', 'nature-butterfly', 'fondo/nube'…
  x: number; y: number; w: number; // % del cuadro
  rot?: number;
  depth: number; // 1 = fondo … 2 = muy cerca de la cámara
  tint?: string; // filtro CSS para variar color (ej. flor naranja)
  flip?: boolean;
}

// Flor naranja: usar la imagen de Gemini cuando llegue (con filtro el centro sale verde).
const PURPLE = 'hue-rotate(-55deg) saturate(0.9)';

/** Horizontal (computadora): mismo orden que la imagen de referencia. */
const WIDE: Layer[] = [
  { img: 'fondo/nube', x: 13, y: 1, w: 15, depth: 1.05 },
  { img: 'fondo/nube', x: 60, y: -3, w: 20, depth: 1.05, flip: true },
  { img: 'fondo/nube', x: 82, y: 54, w: 14, depth: 1.05 },
  { img: 'fondo/nube', x: 42, y: 84, w: 24, depth: 1.05, flip: true },
  { img: 'globos/flor', x: -3, y: -2, w: 16, rot: -10, depth: 1.7 },
  { img: 'shapes-hearts', x: 27, y: 8, w: 6, rot: 8, depth: 1.3 },
  { img: 'shapes-hearts', x: 76, y: 10, w: 6, rot: -12, depth: 1.3, tint: PURPLE },
  { img: 'nature-butterfly', x: 83, y: -1, w: 16, rot: 8, depth: 1.6 },
  { img: 'globos/flor', x: 91, y: 28, w: 10, rot: 20, depth: 1.5 },
  { img: 'shapes-hearts', x: 0, y: 36, w: 6, rot: -6, depth: 1.3, tint: PURPLE },
  { img: 'globos/perrito', x: -1, y: 52, w: 19, depth: 1.8 },
  { img: 'globos/flor', x: 14, y: 76, w: 10, rot: -14, depth: 1.5 },
  { img: 'shapes-hearts', x: 28, y: 78, w: 7, rot: 10, depth: 1.3 },
  { img: 'globos/cerdito', x: 26, y: 68, w: 7, rot: -4, depth: 1.6 },
  { img: 'shapes-hearts', x: 90, y: 64, w: 6, rot: 14, depth: 1.3, tint: PURPLE },
  { img: 'globos/flor', x: 85, y: 80, w: 13, rot: 8, depth: 1.8 },
];

/** Vertical (celular): la misma idea apilada. */
const TALL: Layer[] = [
  { img: 'fondo/nube', x: 30, y: 2, w: 40, depth: 1.05 },
  { img: 'fondo/nube', x: -14, y: 52, w: 34, depth: 1.05, flip: true },
  { img: 'globos/flor', x: -10, y: 4, w: 40, rot: -12, depth: 1.6 },
  { img: 'nature-butterfly', x: 66, y: 5, w: 34, rot: 10, depth: 1.4 },
  { img: 'shapes-hearts', x: 4, y: 49, w: 22, rot: -8, depth: 1.2 },
  { img: 'shapes-hearts', x: 80, y: 46, w: 18, rot: 14, depth: 1.2, tint: PURPLE },
  { img: 'globos/perrito', x: -6, y: 63, w: 50, depth: 1.8 },
  { img: 'globos/cerdito', x: 66, y: 72, w: 28, rot: 4, depth: 1.7 },
  { img: 'globos/flor', x: 34, y: 84, w: 26, rot: 18, depth: 1.5 },
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
  const layers = wide ? WIDE : TALL;
  const twoWords = wide && t.palabraHuamanga && t.palabraClub;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const camera = root.querySelector('.camera')!;
      const toys = gsap.utils.toArray<HTMLElement>('.htoy');

      // Todo se puede lanzar con física (inercia + inclinación); el que agarras pasa adelante
      let z = 100;
      makeThrowable([...toys, ...gsap.utils.toArray<HTMLElement>('.hdrag')], {
        onGrab: (el) => { el.style.zIndex = String(++z); },
      });

      if (reduced) { gsap.set('.bar', { scaleY: 0 }); gsap.set('.cue', { opacity: 1 }); return; }

      // Medir dónde está cada pieza ANTES de mover la cámara
      const offsets = toys.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 };
      });

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      tl.set('.bar', { scaleY: 1 })
        .fromTo(camera, { scale: 2.8, filter: 'blur(14px)' }, { scale: 1, filter: 'blur(0px)', duration: 2.6, ease: 'expo.inOut' }, 0.15)
        .fromTo('.hword', { y: 30, scale: 0.85 }, { y: 0, scale: 1, duration: 2.4, ease: 'expo.inOut', stagger: 0.15 }, 0.2);

      toys.forEach((el, i) => {
        const depth = Number(el.dataset.depth || 1.3);
        const { x: cx, y: cy } = offsets[i];
        const at = 1.3 + i * 0.07;
        tl.fromTo(el.firstElementChild, { x: cx * depth, y: cy * depth, scale: depth * 1.4, opacity: 0, filter: 'blur(8px)' }, {
          x: 0, y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out',
        }, at);
        if (i % 2 === 0) tl.add(() => puff(), at + 0.1);
      });

      tl.fromTo('.vol', { scale: 0, rotation: -25 }, { scale: 1, rotation: -4, duration: 1, ease: 'elastic.out(1, 0.45)' }, 2.6)
        .add(() => pop(), 2.65)
        .to('.bar', { scaleY: 0, duration: 1, ease: 'power3.inOut' }, 2.4)
        .fromTo('.cue', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6 }, 3.3);

      // Después: la cámara "respira" y todo flota despacio, cada pieza a su ritmo.
      tl.add(() => {
        gsap.to(camera, { scale: 1.025, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        toys.forEach((el, i) => gsap.to(el.firstElementChild, {
          y: (i % 2 ? 1 : -1) * gsap.utils.random(8, 16), x: gsap.utils.random(-8, 8), rotation: (i % 2 ? 1 : -1) * gsap.utils.random(2, 5),
          duration: gsap.utils.random(5, 8), ease: 'sine.inOut', yoyo: true, repeat: -1,
        }));
        gsap.utils.toArray<HTMLElement>('.hword').forEach((el, i) => gsap.to(el, {
          y: i % 2 ? 6 : -6, rotation: i % 2 ? 0.8 : -0.8, duration: 6 + i, ease: 'sine.inOut', yoyo: true, repeat: -1,
        }));
      });

      // Paralaje sutil con el mouse (computadora)
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        gsap.to('.parallax', { x: dx * -14, y: dy * -10, duration: 1.4, ease: 'power2.out' });
      };
      window.addEventListener('pointermove', onMove);
      return () => window.removeEventListener('pointermove', onMove);
    }, root);
    return () => ctx.revert();
  }, [wide]);

  const volImg = t.vol
    ? <img src={t.vol} alt={config.evento.vol} draggable={false} className="w-full drop-shadow-[0_10px_14px_rgba(10,31,68,0.3)]" />
    : <span className="text-balloon-black font-display text-[clamp(28px,9vw,52px)]">{config.evento.vol}</span>;

  return (
    <section ref={rootRef} className="relative h-[100svh] w-full overflow-hidden" aria-label={`${config.evento.marca} ${config.evento.vol}`}>
      <div className="parallax absolute inset-[-14px]">
        <div className="camera absolute inset-0 origin-[50%_46%]">
          {layers.map((l, i) => (
            <div key={i} data-depth={l.depth} aria-hidden className="htoy absolute cursor-grab touch-none select-none"
              style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, zIndex: Math.round(l.depth * 10), filter: l.tint }}>
              <img
                {...toyImg(l.img, `${l.w}vw`)}
                alt="" draggable={false}
                className="w-full drop-shadow-[0_16px_22px_rgba(10,31,68,0.2)]"
                style={{ transform: `rotate(${l.rot ?? 0}deg) scaleX(${l.flip ? -1 : 1})` }}
              />
            </div>
          ))}

          {/* Título */}
          {twoWords ? (
            <div className="absolute inset-x-0 top-[23%] z-[15] flex flex-col items-center">
              <img src={t.palabraHuamanga} alt="Huamanga" draggable={false} className="hword hdrag w-[64%] cursor-grab touch-none drop-shadow-[0_24px_30px_rgba(10,31,68,0.28)]" />
              <div className="relative -mt-[1%] w-[38%]">
                <img src={t.palabraClub} alt="Club" draggable={false} className="hword hdrag w-full cursor-grab touch-none drop-shadow-[0_24px_30px_rgba(10,31,68,0.28)]" />
                <div className="vol hdrag absolute bottom-[8%] left-[102%] w-[42%] origin-left cursor-grab touch-none">{volImg}</div>
              </div>
            </div>
          ) : (
            <div className={`absolute inset-x-0 z-[15] mx-auto ${wide ? 'top-[10%] w-[34%]' : 'top-[24%] w-[78%] max-w-[520px]'}`}>
              <img src={t.club} alt={config.evento.marca} draggable={false} className="hword hdrag w-full cursor-grab touch-none drop-shadow-[0_24px_30px_rgba(10,31,68,0.28)]" />
              <div className={`vol hdrag absolute origin-left cursor-grab touch-none ${wide ? '-right-[52%] bottom-[10%] w-[50%]' : '-bottom-[14%] right-[-4%] w-[46%]'}`}>
                {volImg}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Franjas de cine */}
      <div aria-hidden className="bar pointer-events-none absolute inset-x-0 top-0 z-30 h-[12vh] origin-top scale-y-0 bg-black" />
      <div aria-hidden className="bar pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[12vh] origin-bottom scale-y-0 bg-black" />

      <button onClick={onScrollHint} className="cue btn-ghost absolute bottom-6 left-1/2 z-40 -translate-x-1/2 opacity-0">
        Ver el line-up <ChevronDown size={18} className="animate-bounce" />
      </button>
    </section>
  );
}
