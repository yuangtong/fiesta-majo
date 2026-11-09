import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { Application } from '@splinetool/runtime';
import { Hand } from 'lucide-react';
import { config } from '../config';
import { SplineScene } from '../components/SplineScene';
import { BubbleWords } from '../components/BubbleWords';
import { Floaties } from '../components/Floaties';
import { prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

// Pantalla 2, en dos tiempos:
//  1) "Huamanga Club" en letras globo 3D a pantalla completa, sin nada encima: se pueden arrastrar.
//  2) El cartel de club: Edición 0, fecha, dirección y line-up.
export function ClubScreen({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<'globos' | 'cartel'>('globos');
  return phase === 'globos'
    ? <Globos onNext={() => setPhase('cartel')} />
    : <Cartel onNext={onNext} />;
}

function Globos({ onNext }: { onNext: () => void }) {
  const e = config.evento;
  const c = config.club;

  // Las letras entran inflándose una por una (si la escena cargó)
  const onReady = (app: Application) => {
    squeak(0.3);
    if (prefersReducedMotion()) return;
    app.getAllObjects().filter((o) => o.name.startsWith('club-')).forEach((o, i) => {
      const s = { ...o.scale };
      const v = { k: 0 };
      gsap.to(v, {
        k: 1, duration: 0.9, delay: 0.1 + i * 0.05, ease: 'elastic.out(1, 0.45)',
        onUpdate: () => { o.scale.x = s.x * v.k; o.scale.y = s.y * v.k; o.scale.z = s.z * v.k; },
      });
    });
  };

  return (
    <div className="pointer-events-none relative flex h-full w-full flex-col">
      {/* La escena ocupa todo el espacio libre: nada se pone encima de las letras */}
      <SplineScene
        scene={config.spline.club}
        onReady={onReady}
        interactive
        className="pointer-events-auto min-h-0 w-full flex-1"
        fallback={<BubbleWords text={e.marca} className="text-inflated text-center text-[clamp(56px,16vw,120px)] leading-[0.95]" />}
      />
      <div className="pointer-events-auto flex shrink-0 flex-col items-center gap-3 px-5 pb-8 pt-2">
        <p className="flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-ink backdrop-blur">
          <Hand size={16} /> {c.hint}
        </p>
        <button className="btn-balloon" onClick={onNext}>{c.ctaLineup}</button>
      </div>
    </div>
  );
}

function Cartel({ onNext }: { onNext: () => void }) {
  const e = config.evento;
  const c = config.club;
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!posterRef.current || prefersReducedMotion()) return;
    // Las filas del cartel se "encienden" como una pantalla de puntos
    const tween = gsap.fromTo(posterRef.current.querySelectorAll('.row'), { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'steps(12)', stagger: 0.09, delay: 0.2,
    });
    return () => { tween.kill(); };
  }, []);

  return (
    <div className="screen justify-center gap-5">
      <Floaties items={[
        { img: 'nature-star', x: '6%', y: '5%', size: 60, rot: -12 },
        { img: 'shapes-hearts', x: '78%', y: '8%', size: 66, rot: 10 },
        { img: 'nature-comet', x: '76%', y: '82%', size: 78 },
      ]} />

      <div ref={posterRef} className="relative z-10 flex w-full max-w-[420px] flex-col items-start gap-1.5 font-dot font-black uppercase">
        <span className="row bg-white px-2 text-lg text-ink">{e.marca} {c.presenta}</span>
        <span className="row bg-ink px-2 text-[clamp(38px,12vw,56px)] leading-none text-white">{e.edicion}</span>
        <span className="row bg-balloon px-2 text-2xl text-white">{e.nombre}</span>
        <span className="row mt-3 bg-white px-2 text-xl text-ink">{e.fechaLarga}</span>
        <span className="row bg-white px-2 text-xl text-ink">{e.hora}</span>
        <span className="row bg-white px-2 text-xl text-ink">{e.direccion}</span>

        <span className="row mt-4 bg-white px-2 text-sm text-ink">Sets de</span>
        {c.lineup.map((l) => (
          <span key={l.nombre} className="row bg-ink px-2 text-xl text-white">
            <span className="text-balloon-light">{l.hora}</span> {l.nombre}
          </span>
        ))}
      </div>

      <p className="relative z-10 max-w-[420px] text-center text-sm font-semibold text-white drop-shadow">{c.nota}</p>
      <button className="btn-balloon relative z-10" onClick={onNext}>{c.cta}</button>
    </div>
  );
}
