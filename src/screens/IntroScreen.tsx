import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { config } from '../config';
import { Envelope } from '../components/Envelope';
import { BubbleWords } from '../components/BubbleWords';
import { SplineScene } from '../components/SplineScene';
import { plasticine, prefersReducedMotion } from '../lib/motion';
import { pop, puff, squeak } from '../lib/sfx';

const BURST = ['shapes-star', 'shapes-hearts', 'nature-comet', 'nature-star', 'shapes-zigzag', 'nature-clouds', 'nature-rainbow', 'shapes-wave'];
const CONFETTI = ['#FF4D6D', '#FFFFFF', '#4BB1F8', '#FFD43B', '#7B5CFF'];

// Pantalla 0–1: sobre cerrado → se abre → salen objetos inflándose → explotan → "Estás invitado".
export function IntroScreen({ onStart, onNext }: { onStart: () => void; onNext: () => void }) {
  const [phase, setPhase] = useState<'sobre' | 'abriendo' | 'invitado'>('sobre');
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const i = config.intro;

  const open = () => {
    if (phase !== 'sobre') return;
    onStart(); // desbloquea el audio con este toque
    setPhase('abriendo');
    const reduced = prefersReducedMotion();
    const q = gsap.utils.selector(rootRef);
    const tl = gsap.timeline({ onComplete: () => setPhase('invitado') });

    if (reduced) {
      tl.to(q('.env-stage'), { opacity: 0, duration: 0.3 });
      return;
    }

    tl.add(() => pop())
      .to(q('.env-seal'), { scale: 1.6, opacity: 0, duration: 0.25, ease: 'power2.out' })
      .to(q('.env-flap'), { rotationX: -180, duration: 0.6, ease: 'power2.inOut' }, '<0.05')
      .set(q('.env-flap'), { zIndex: 0 })
      .to(q('.env-letter'), { yPercent: -62, duration: 0.7, ease: 'back.out(1.6)' }, '-=0.1')
      .to(q('.env'), { scale: 0.92, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '<');

    // Objetos que salen "inflándose" del sobre
    const items = q('.burst');
    items.forEach((el, k) => {
      const angle = (k / items.length) * Math.PI * 2 - Math.PI / 2;
      const r = gsap.utils.random(120, 190);
      tl.add(() => puff(), 1.05 + k * 0.09);
      tl.fromTo(el, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0, opacity: 1, rotation: gsap.utils.random(-60, 60) }, {
        x: Math.cos(angle) * r, y: Math.sin(angle) * r * 1.2, scale: 1, rotation: 0,
        duration: 0.7, ease: 'back.out(2.2)',
      }, 1.05 + k * 0.09);
    });

    // ...y explotan
    items.forEach((el, k) => {
      const t = 2.15 + k * 0.08;
      tl.add(() => {
        pop();
        const rect = el.getBoundingClientRect();
        confetti({
          particleCount: 14, spread: 70, startVelocity: 22, scalar: 0.8, ticks: 90,
          origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
          colors: CONFETTI, disableForReducedMotion: true,
        });
      }, t);
      tl.to(el, { scale: 1.35, duration: 0.08, ease: 'power1.out' }, t);
      tl.to(el, { scale: 0, opacity: 0, duration: 0.12, ease: 'power2.in' }, t + 0.08);
    });

    tl.to(q('.env-stage'), { y: 40, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.05');
  };

  useEffect(() => {
    if (phase !== 'invitado' || !titleRef.current) return;
    squeak(0.15);
    confetti({ particleCount: 90, spread: 100, origin: { y: 0.45 }, colors: CONFETTI, disableForReducedMotion: true });
    if (!prefersReducedMotion()) {
      gsap.fromTo(titleRef.current.querySelectorAll('.after'), { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.12, delay: 0.9,
      });
    }
  }, [phase]);

  if (phase === 'invitado') {
    const fallbackTitle = <BubbleWords text={i.titulo} className="text-inflated text-center text-[clamp(56px,17vw,92px)] leading-[0.95]" />;
    return (
      <div ref={titleRef} className="screen justify-center gap-6 text-center">
        {config.spline.invitadoActivo ? (
          <SplineScene scene={config.spline.invitado} fallback={fallbackTitle} className="h-[46vh] w-full" />
        ) : (
          fallbackTitle
        )}
        <p className="after font-display text-[clamp(24px,7vw,34px)] leading-tight text-white drop-shadow-[0_3px_0_rgba(217,38,74,0.6)]">
          {i.subtitulo}
        </p>
        <button className="after btn-balloon mt-4" onClick={onNext}>{i.cta2}</button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="screen justify-center">
      <div className="env-stage relative flex flex-col items-center gap-8">
        <p className="font-dot text-lg font-black uppercase text-white drop-shadow">
          {config.evento.marca} · {config.evento.edicion}
        </p>
        <div className="relative">
          <Envelope to={i.para} onOpen={open} disabled={phase !== 'sobre'}>
            <p className="font-dot text-xs font-black uppercase text-balloon">{config.evento.marca}</p>
            <p className="font-display text-xl leading-tight text-ink">{i.titulo}</p>
          </Envelope>
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
            {BURST.map((img) => (
              <img
                key={img}
                src={plasticine(img)}
                alt=""
                className="burst absolute w-20 opacity-0"
              />
            ))}
          </div>
        </div>
        <p className={`text-base font-bold text-white transition-opacity ${phase === 'sobre' ? 'animate-pulse' : 'opacity-0'}`}>
          {i.cta}
        </p>
      </div>
    </div>
  );
}
