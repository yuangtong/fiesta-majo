import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Application } from '@splinetool/runtime';
import { config } from '../config';
import { SplineScene } from '../components/SplineScene';
import { BubbleWords } from '../components/BubbleWords';
import { Floaties } from '../components/Floaties';
import { prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

// Pantalla 2: "Huamanga Club presenta: Edición 0". Letras globo 3D (Spline) + cartel de club.
export function ClubScreen({ onNext }: { onNext: () => void }) {
  const e = config.evento;
  const c = config.club;
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!posterRef.current || prefersReducedMotion()) return;
    const rows = posterRef.current.querySelectorAll('.row');
    // Las filas del cartel entran como una pantalla de puntos que se "enciende"
    gsap.fromTo(rows, { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'steps(12)', stagger: 0.1, delay: 0.4,
    });
  }, []);

  // Las letras 3D entran una por una (si la escena cargó)
  const onReady = (app: Application) => {
    if (prefersReducedMotion()) return;
    const letters = app.getAllObjects().filter((o) => o.name.startsWith('club-'));
    letters.forEach((o, i) => {
      const s = { ...o.scale };
      const v = { k: 0 };
      gsap.to(v, {
        k: 1, duration: 0.9, delay: 0.1 + i * 0.05, ease: 'elastic.out(1, 0.45)',
        onUpdate: () => { o.scale.x = s.x * v.k; o.scale.y = s.y * v.k; o.scale.z = s.z * v.k; },
      });
    });
    squeak(0.3);
  };

  return (
    <div className="screen gap-4">
      <Floaties items={[
        { img: 'nature-star', x: '4%', y: '6%', size: 64, rot: -12 },
        { img: 'shapes-hearts', x: '76%', y: '30%', size: 70, rot: 10 },
        { img: 'nature-comet', x: '78%', y: '80%', size: 80 },
      ]} />

      <SplineScene
        scene={config.spline.club}
        onReady={onReady}
        className="h-[34vh] min-h-[220px] w-full max-w-[440px]"
        fallback={<BubbleWords text={e.marca} className="text-inflated text-center text-[clamp(48px,15vw,80px)] leading-[0.95]" />}
      />

      <div ref={posterRef} className="relative z-10 flex w-full max-w-[400px] flex-col items-start gap-1.5 font-dot font-black uppercase">
        <span className="row bg-white px-2 text-lg text-ink">{c.presenta}</span>
        <span className="row bg-ink px-2 text-[clamp(36px,11vw,52px)] leading-none text-white">{e.edicion}</span>
        <span className="row bg-balloon px-2 text-2xl text-white">{e.nombre}</span>
        <span className="row mt-2 bg-white px-2 text-lg text-ink">{e.fechaLarga}</span>
        <span className="row bg-white px-2 text-lg text-ink">{e.hora}</span>
        <span className="row bg-white px-2 text-lg text-ink">{e.direccion}</span>

        <span className="row mt-3 bg-white px-2 text-sm text-ink">Sets de</span>
        {c.lineup.map((l) => (
          <span key={l.nombre} className="row bg-ink px-2 text-xl text-white">
            <span className="text-balloon-light">{l.hora}</span> {l.nombre}
          </span>
        ))}
      </div>

      <p className="relative z-10 max-w-[400px] self-center text-center text-sm font-semibold text-white drop-shadow">{c.nota}</p>

      <button className="btn-balloon relative z-10 mt-2" onClick={onNext}>{c.cta}</button>
    </div>
  );
}
