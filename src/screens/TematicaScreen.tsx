import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { config } from '../config';
import { CrossedGift } from '../components/CrossedGift';
import { plasticine, prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

// Pantalla 4: qué significa "La ocasión incorrecta", con ejemplos como stickers que se pueden apretar.
export function TematicaScreen({ onNext }: { onNext: () => void }) {
  const t = config.tematica;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.lead', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.09 });
      gsap.fromTo('.sticker', { scale: 0, rotation: () => gsap.utils.random(-30, 30) }, {
        scale: 1, rotation: (i) => (i % 2 ? 4 : -4), duration: 0.8, ease: 'elastic.out(1, 0.5)', stagger: 0.07, delay: 0.35,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  // Apretar un sticker: se aplasta como juguete de goma
  const squish = (el: HTMLElement) => {
    squeak();
    if (prefersReducedMotion()) return;
    gsap.fromTo(el, { scaleX: 1.15, scaleY: 0.85 }, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.35)' });
  };

  return (
    <div ref={ref} className="screen gap-6">
      <div className="lead flex w-full max-w-[420px] items-end gap-3">
        <CrossedGift size={92} />
        <p className="pb-2 font-dot text-lg font-black uppercase leading-tight text-white drop-shadow">Dress code</p>
      </div>
      <h2 className="lead text-inflated w-full max-w-[420px] text-[clamp(46px,14vw,68px)] leading-[0.92]">{t.titulo}</h2>
      <p className="lead w-full max-w-[420px] text-[22px] font-extrabold leading-snug text-white drop-shadow-[0_2px_0_rgba(10,31,68,0.25)]">
        {t.texto}
      </p>

      <ul className="grid w-full max-w-[420px] grid-cols-3 gap-3" aria-label="Ejemplos de ocasiones">
        {t.ejemplos.map((e) => (
          <li key={e.label}>
            <button
              type="button"
              onClick={(ev) => squish(ev.currentTarget)}
              className="sticker flex w-full flex-col items-center gap-1 rounded-[22px] bg-white px-2 pb-2.5 pt-3 shadow-[0_10px_20px_rgba(10,31,68,0.14)]"
            >
              <img src={plasticine(e.img)} alt="" className="h-16 w-16 object-contain" />
              <span className="text-sm font-extrabold text-ink">{e.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="lead w-full max-w-[420px] rounded-[22px] bg-ink px-4 py-3 text-sm font-semibold leading-relaxed text-white">
        {t.noVale}
      </p>

      <button className="lead btn-balloon" onClick={onNext}>{t.cta}</button>
    </div>
  );
}
