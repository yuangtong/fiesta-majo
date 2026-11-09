import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Hand } from 'lucide-react';
import { config } from '../config';
import { BalloonTitle } from '../components/BalloonTitle';
import { Floaties } from '../components/Floaties';
import { prefersReducedMotion } from '../lib/motion';

// Pantalla 2: "Huamanga Club" en letras globo (arrastrables) + el cartel de club con fecha y line-up.
// En celular el cartel va alineado a la izquierda como un póster; en computadora, centrado.
export function ClubScreen({ onNext }: { onNext: () => void }) {
  const e = config.evento;
  const c = config.club;
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!posterRef.current || prefersReducedMotion()) return;
    // Las filas del cartel se "encienden" como una pantalla de puntos
    const tween = gsap.fromTo(posterRef.current.querySelectorAll('.row'), { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'steps(12)', stagger: 0.08, delay: 0.6,
    });
    return () => { tween.kill(); };
  }, []);

  return (
    <div className="screen gap-4 md:justify-center">
      <Floaties items={[
        { img: 'nature-star', x: '-7%', y: '26%', size: 84, rot: -12 },
        { img: 'shapes-hearts', x: '80%', y: '22%', size: 84, rot: 10 },
        { img: 'nature-comet', x: '72%', y: '84%', size: 116 },
      ]} />

      {/* Espacio propio para los globos: nada se pone encima */}
      <div className="relative w-full max-w-[560px] shrink-0">
        <BalloonTitle
          text={e.marca}
          img={config.titulos.club}
          spline={config.spline.club}
          className="h-[40svh] max-h-[460px] min-h-[240px] w-full md:h-[46vh]"
          textClass="text-[clamp(56px,16vw,120px)]"
        />
        <p className="mx-auto -mt-2 flex w-fit items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-ink backdrop-blur">
          <Hand size={16} /> {c.hint}
        </p>
      </div>

      <div ref={posterRef} className="relative z-10 flex w-full max-w-[420px] flex-col items-start gap-1.5 font-dot font-black uppercase md:max-w-[640px] md:items-center md:text-center">
        <span className="row bg-white px-2 text-lg text-ink md:text-2xl">{e.marca} {c.presenta}</span>
        <span className="row bg-ink px-2 text-[clamp(38px,12vw,56px)] leading-none text-white md:text-[80px]">{e.edicion}</span>
        <span className="row bg-balloon px-2 text-2xl text-white md:text-4xl">{e.nombre}</span>
        <span className="row mt-3 bg-white px-2 text-xl text-ink md:text-2xl">{e.fechaLarga}</span>
        <span className="row bg-white px-2 text-xl text-ink md:text-2xl">{e.hora}</span>
        <span className="row bg-white px-2 text-xl text-ink md:text-2xl">{e.direccion}</span>

        <span className="row mt-4 bg-white px-2 text-sm text-ink md:text-base">Sets de</span>
        {c.lineup.map((l) => (
          <span key={l.nombre} className="row bg-ink px-2 text-xl text-white md:text-2xl">
            <span className="text-balloon-light">{l.hora}</span> {l.nombre}
          </span>
        ))}
      </div>

      <p className="relative z-10 max-w-[420px] text-center text-sm font-semibold text-legible">{c.nota}</p>
      <button className="btn-balloon relative z-10 shrink-0" onClick={onNext}>{c.cta}</button>
    </div>
  );
}
