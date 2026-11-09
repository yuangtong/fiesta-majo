import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { config } from '../config';
import { CrossedGift } from '../components/CrossedGift';
import { Floaties } from '../components/Floaties';
import { TikToks } from '../components/TikToks';
import { plasticine, prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

gsap.registerPlugin(Draggable);

// Pantalla 4: qué significa "La ocasión incorrecta", con ejemplos como stickers que se pueden apretar.
export function TematicaScreen({ onNext }: { onNext: () => void }) {
  const t = config.tematica;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Las cartas se pueden arrastrar a cualquier parte; un toque sin arrastrar las aplasta.
    const drags = Draggable.create(ref.current.querySelectorAll('.sticker'), {
      bounds: window,
      zIndexBoost: true,
      onClick() { squish(this.target as HTMLElement); },
      onPress() { squeak(); },
    });
    if (prefersReducedMotion()) return () => drags.forEach((d) => d.kill());
    const ctx = gsap.context(() => {
      gsap.fromTo('.lead', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.09 });
      gsap.fromTo('.sticker', { scale: 0, rotation: () => gsap.utils.random(-30, 30) }, {
        scale: 1, rotation: (i) => (i % 2 ? 4 : -4), duration: 0.8, ease: 'elastic.out(1, 0.5)', stagger: 0.07, delay: 0.35,
      });
    }, ref);
    return () => { drags.forEach((d) => d.kill()); ctx.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apretar un sticker: se aplasta como juguete de goma
  const squish = (el: HTMLElement) => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(el, { scaleX: 1.15, scaleY: 0.85 }, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.35)' });
  };

  return (
    <div ref={ref} className="screen gap-6 md:justify-center md:text-center">
      <Floaties items={[
        { img: 'nature-fish', x: '74%', y: '2%', size: 104, rot: 12 },
        { img: 'nature-sun', x: '-10%', y: '90%', size: 96 },
        { img: 'globos/flor', x: '78%', y: '86%', size: 100, rot: -12 },
      ]} />
      <div className="lead flex w-full max-w-[420px] items-end gap-3 md:max-w-[640px] md:justify-center">
        <CrossedGift size={92} />
        <p className="pb-2 font-dot text-lg font-black uppercase leading-tight text-legible">Dress code</p>
      </div>
      <h2 className="lead text-inflated w-full max-w-[420px] text-[clamp(46px,14vw,68px)] leading-[0.92] md:max-w-[640px] md:text-[96px]">{t.titulo}</h2>
      <p className="lead w-full max-w-[420px] text-[22px] md:max-w-[560px] md:text-[28px] font-extrabold leading-snug text-legible">
        {t.texto}
      </p>

      <ul className="grid w-full max-w-[420px] grid-cols-3 gap-3 md:max-w-[640px] md:grid-cols-6" aria-label="Ejemplos de ocasiones">
        {t.ejemplos.map((e) => (
          <li key={e.label}>
            <button
              type="button"
              aria-label={e.label}
              className="sticker relative flex cursor-grab touch-none w-full flex-col items-center gap-1 rounded-[22px] bg-white px-2 pb-2.5 pt-3 shadow-[0_10px_20px_rgba(10,31,68,0.14)]"
            >
              <img src={plasticine(e.img)} alt="" className="h-16 w-16 object-contain" />
              <span className="text-sm font-extrabold text-ink">{e.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="lead w-full md:flex md:justify-center">
        <TikToks items={t.tiktoks} titulo="Ideas para inspirarte" />
      </div>

      <p className="lead w-full max-w-[420px] md:max-w-[560px] rounded-[22px] bg-ink px-4 py-3 text-sm font-semibold leading-relaxed text-white">
        {t.noVale}
      </p>

      <button className="lead btn-balloon" onClick={onNext}>{t.cta}</button>
    </div>
  );
}
