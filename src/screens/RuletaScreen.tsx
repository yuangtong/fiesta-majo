import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { config } from '../config';
import { CrossedGift } from '../components/CrossedGift';
import { plasticine, prefersReducedMotion } from '../lib/motion';
import { tada, tick } from '../lib/sfx';

// Pantalla 3: ruleta de temáticas. Parece aleatoria, pero SIEMPRE cae en "La ocasión incorrecta".
// Inspirada en scroll-morph-hero (cartas dispersas → fila → círculo), hecha con GSAP.
const CARD_W = 74;
const CARD_H = 100;

export function RuletaScreen({ onNext }: { onNext: () => void }) {
  const r = config.ruleta;
  // Con el giro en sentido horario, la carta que pasa por el puntero justo antes de la última es la primera:
  // por eso "Cumpleaños" va primera y la ganadora última (la ruleta casi se detiene en Cumpleaños).
  const cards = [r.opciones.find((o) => o.id === 'cumple')!, ...r.opciones.filter((o) => o.id !== 'cumple'), { ...r.ganadora, winner: true as const }];
  const N = cards.length;
  const step = 360 / N;
  const winnerIdx = N - 1;

  const stageRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'intro' | 'listo' | 'girando' | 'resultado'>('intro');
  const [size, setSize] = useState(320);

  useEffect(() => {
    const update = () => setSize(Math.min(window.innerWidth - 32, 380));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const radius = size * 0.36;
  const circlePos = (i: number) => {
    const a = (i * step * Math.PI) / 180;
    return { x: Math.sin(a) * radius, y: -Math.cos(a) * radius, rotation: i * step };
  };

  // Entrada: dispersas → fila → círculo
  useEffect(() => {
    const els = gsap.utils.toArray<HTMLElement>('.rcard', stageRef.current);
    if (prefersReducedMotion()) {
      els.forEach((el, i) => gsap.set(el, { ...circlePos(i), xPercent: -50, yPercent: -50, opacity: 1 }));
      setPhase('listo');
      return;
    }
    const tl = gsap.timeline({ onComplete: () => setPhase('listo') });
    els.forEach((el, i) => {
      tl.fromTo(el, {
        xPercent: -50, yPercent: -50, opacity: 0, scale: 0.6,
        x: gsap.utils.random(-260, 260), y: gsap.utils.random(-380, 380), rotation: gsap.utils.random(-90, 90),
      }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, i * 0.04);
    });
    const spacing = Math.min(56, (size - CARD_W) / (N - 1));
    tl.to(els, {
      x: (i) => i * spacing - ((N - 1) * spacing) / 2, y: 0, rotation: 0, scale: 0.85,
      duration: 0.8, ease: 'power3.inOut', stagger: 0.03,
    }, '+=0.2');
    tl.to(els, {
      x: (i) => circlePos(i).x, y: (i) => circlePos(i).y, rotation: (i) => circlePos(i).rotation, scale: 1,
      duration: 1, ease: 'back.out(1.3)', stagger: 0.03,
    }, '+=0.35');
    return () => { tl.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const spin = () => {
    if (phase !== 'listo' || !wheelRef.current) return;
    setPhase('girando');
    const target = 360 * 6 + (360 - winnerIdx * step);
    const state = { rot: 0 };
    let lastSlot = 0;
    const apply = () => {
      gsap.set(wheelRef.current, { rotation: state.rot });
      const slot = Math.floor((state.rot + step / 2) / step);
      if (slot !== lastSlot) { lastSlot = slot; tick(); }
    };
    const tl = gsap.timeline({ onComplete: reveal });
    if (prefersReducedMotion()) {
      tl.to(state, { rot: target, duration: 0.6, onUpdate: apply });
    } else {
      // Casi se detiene en "Cumpleaños"… y avanza una más.
      tl.to(state, { rot: target - step * 0.92, duration: 4.4, ease: 'power3.out', onUpdate: apply })
        .to(state, { rot: target, duration: 0.9, ease: 'power2.inOut', onUpdate: apply }, '+=0.45');
    }
  };

  const reveal = () => {
    tada();
    confetti({ particleCount: 120, spread: 110, origin: { y: 0.5 }, colors: ['#FF4D6D', '#FFFFFF', '#4BB1F8', '#FFD43B'], disableForReducedMotion: true });
    const others = gsap.utils.toArray<HTMLElement>('.rcard:not(.is-winner)', stageRef.current);
    gsap.to(others, { opacity: 0, scale: 0.5, duration: 0.4, stagger: 0.02 });
    gsap.to('.rcard.is-winner', { opacity: 0, duration: 0.2, delay: 0.3 });
    setPhase('resultado');
  };

  useEffect(() => {
    if (phase !== 'resultado' || !resultRef.current) return;
    gsap.fromTo(resultRef.current.children, { scale: 0.3, opacity: 0, y: 20 }, {
      scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.55)', stagger: 0.12, delay: 0.35,
    });
  }, [phase]);

  return (
    <div className="screen gap-4">
      <div className="text-center">
        <p className="font-dot text-lg font-black uppercase text-white drop-shadow">{r.subtitulo}</p>
        <h2 className="text-inflated text-[clamp(44px,13vw,64px)] leading-none">{r.titulo}</h2>
      </div>

      <div ref={stageRef} className="relative shrink-0" style={{ width: size, height: size }}>
        {/* Puntero */}
        <div aria-hidden className="absolute left-1/2 top-[-6px] z-20 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[22px] border-x-transparent border-t-balloon drop-shadow" />
        <div ref={wheelRef} className="absolute left-1/2 top-1/2 h-0 w-0">
          {cards.map((c, i) => (
            <div
              key={c.id}
              className={`rcard absolute left-0 top-0 flex flex-col items-center justify-between rounded-2xl bg-white p-1.5 opacity-0 shadow-[0_8px_18px_rgba(10,31,68,0.18)] ${'winner' in c ? 'is-winner ring-4 ring-balloon' : ''}`}
              style={{ width: CARD_W, height: CARD_H }}
            >
              {'winner' in c ? <CrossedGift size={56} /> : <img src={plasticine(c.img)} alt="" className="h-14 w-14 object-contain" />}
              <span className="text-center text-[10px] font-extrabold leading-tight text-ink">{c.label}</span>
            </div>
          ))}
        </div>

        {phase === 'resultado' && (
          <div ref={resultRef} className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 text-center">
            <CrossedGift size={150} />
            <p className="text-inflated text-[clamp(34px,10vw,48px)] leading-none">{r.ganadora.label}</p>
          </div>
        )}
      </div>

      {phase === 'resultado' ? (
        <button className="btn-balloon" onClick={onNext}>¿Qué significa?</button>
      ) : (
        <button className="btn-balloon" onClick={spin} disabled={phase !== 'listo'}>
          {phase === 'girando' ? 'Girando…' : r.cta}
        </button>
      )}
      <p className="sr-only" aria-live="polite">{phase === 'resultado' ? `Resultado: ${r.ganadora.label}` : ''}</p>
    </div>
  );
}
