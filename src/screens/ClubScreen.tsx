import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { config } from '../config';
import { DragBuddy } from '../components/DragBuddy';
import { ClubHero } from '../components/ClubHero';
import { prefersReducedMotion } from '../lib/motion';

// Pantalla 2: escena de cine "Huamanga Club · Vol 0." y, bajando, el cartel con fecha y line-up.
// En celular el cartel va alineado a la izquierda como un póster; en computadora, centrado.
export function ClubScreen({ onNext }: { onNext: () => void }) {
  const e = config.evento;
  const c = config.club;
  const scrollRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  // Las filas del cartel se "encienden" como pantalla de puntos cuando llegan a la vista
  useEffect(() => {
    const poster = posterRef.current;
    if (!poster || prefersReducedMotion()) return;
    const rows = poster.querySelectorAll('.row');
    gsap.set(rows, { clipPath: 'inset(0 100% 0 0)' });
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gsap.to(rows, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'steps(12)', stagger: 0.08, clearProps: 'clipPath' });
      io.disconnect();
    }, { root: scrollRef.current, threshold: 0.15 });
    io.observe(poster);
    return () => io.disconnect();
  }, []);

  const toPoster = () => posterRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });

  return (
    <div ref={scrollRef} data-passthrough className="h-full w-full overflow-y-auto overscroll-contain">
      <ClubHero onScrollHint={toPoster} />

      <div data-passthrough className="relative flex flex-col items-center gap-5 px-5 pb-16 pt-12">

        <div ref={posterRef} className="relative z-10 flex w-full max-w-[420px] scroll-mt-10 flex-col items-start gap-1.5 font-dot font-black uppercase md:max-w-[640px] md:items-center md:text-center">
          <span className="row bg-white px-2 text-lg text-ink md:text-2xl">{e.marca} {c.presenta}</span>
          <span className="row bg-ink px-2 text-[clamp(38px,12vw,56px)] leading-none text-white md:text-[80px]">{e.edicion}</span>
          <span className="row bg-balloon px-2 text-2xl text-white md:text-4xl">{e.nombre}</span>
          <span className="row mt-3 bg-white px-2 text-xl text-ink md:text-2xl">{e.fechaLarga}</span>
          <span className="row bg-white px-2 text-xl text-ink md:text-2xl">{e.hora}</span>
          <span className="row bg-white px-2 text-xl text-ink md:text-2xl">{e.direccion}</span>
          <span className="row bg-white px-2 text-xl text-ink md:text-2xl">{e.distrito}</span>

          <span className="row mt-4 bg-white px-2 text-sm text-ink md:text-base">Sets de</span>
          <DragBuddy img="globos/hipo" sizes="(min-width: 768px) 220px, 40vw"
            className="-bottom-8 right-0 w-[30%] max-w-[200px] md:-right-40 md:bottom-[-10px] md:w-[200px]"
            imgClass="drop-shadow-[0_14px_18px_rgba(10,31,68,0.22)]" />
          {c.lineup.map((l) => (
            <span key={l.nombre} className="row bg-ink px-2 text-xl normal-case text-white md:text-2xl">
              {l.hora && <span className="text-balloon-light">{l.hora} </span>}{l.nombre}
            </span>
          ))}
        </div>

        <button className="btn-balloon relative z-10" onClick={onNext}>{c.cta}</button>
      </div>
    </div>
  );
}
