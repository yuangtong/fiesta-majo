import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { config } from '../config';
import { BubbleWords } from '../components/BubbleWords';
import { BalloonTitle } from '../components/BalloonTitle';
import { Floaties } from '../components/Floaties';
import { prefersReducedMotion, toyImg } from '../lib/motion';
import { pop, puff, squeak } from '../lib/sfx';

// Pantalla 0–1, la apertura:
//  1) sobre DESINFLADO con 4 globos alrededor → "Revienta los globos"
//  2) cada globo que revientas (pop + confeti de su color) infla un poco el sobre
//  3) inflado del todo → "Toca para abrir"
//  4) se abre, sube la carta con "Estás invitado" y la cámara se acerca a la carta
//  5) corte al título grande; los juguetes salen volando desde el sobre y se quedan flotando.

const BALLOONS = [
  { img: 'globos/globo-rosa', color: '#FF3E8A', x: '0%', y: '8%', w: 22, rot: -10 },
  { img: 'globos/globo-azul', color: '#3FB4F0', x: '80%', y: '7%', w: 21, rot: 8 },
  { img: 'globos/globo-amarillo', color: '#FFD43B', x: '1%', y: '58%', w: 20, rot: -6 },
  { img: 'globos/globo-plata', color: '#D9DEE6', x: '79%', y: '55%', w: 23, rot: 10 },
];
const CONFETTI = ['#FF4D6D', '#FFFFFF', '#4BB1F8', '#FFD43B', '#7B5CFF'];
const SOBRE = (n: 'desinflado' | 'inflado' | 'abierto') => ({
  src: `/images/sobre/${n}-480.webp`,
  srcSet: `/images/sobre/${n}-480.webp 480w, /images/sobre/${n}.webp 1000w`,
  sizes: '(min-width: 768px) 380px, 76vw',
});

type Phase = 'globos' | 'listo' | 'abriendo' | 'invitado';

export function IntroScreen({ onStart, onNext }: { onStart: () => void; onNext: () => void }) {
  const [phase, setPhase] = useState<Phase>('globos');
  const [popped, setPopped] = useState<boolean[]>(() => BALLOONS.map(() => false));
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const busy = useRef<Set<number>>(new Set());
  const i = config.intro;
  const reduced = prefersReducedMotion();
  const count = popped.filter(Boolean).length;

  const q = (sel: string) => rootRef.current?.querySelector<HTMLElement>(sel) ?? null;

  // Globos y sobre flotan mientras esperan
  useEffect(() => {
    if (reduced || !rootRef.current || (phase !== 'globos' && phase !== 'listo')) return;
    const ctx = gsap.context(() => {
      gsap.to('.env-float', { y: -10, rotation: 1.2, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.utils.toArray<HTMLElement>('.balloon-float').forEach((el, k) => {
        gsap.to(el, { y: k % 2 ? -14 : 12, rotation: `+=${k % 2 ? 4 : -4}`, duration: 3 + k * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
      gsap.from('.balloon-btn', { scale: 0, duration: 0.9, stagger: 0.1, ease: 'elastic.out(1, 0.5)', delay: 0.2 });
    }, rootRef);
    return () => ctx.revert();
    // solo al montar / cambiar de fase: los globos reventados se desmontan solos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'globos' || phase === 'listo', reduced]);

  // Inflado del sobre según cuántos globos reventaste
  useEffect(() => {
    const flat = q('.env-flat');
    const full = q('.env-full');
    const body = q('.env-body');
    if (!flat || !full || !body || phase === 'abriendo') return;
    const p = count / BALLOONS.length;
    const s = 0.84 + 0.16 * p;
    // el inflado aparece encima del desinflado (que queda opaco debajo): sin transparencias
    gsap.set(flat, { opacity: p >= 1 ? 0 : 1 });
    gsap.to(full, { opacity: p, duration: reduced ? 0 : 0.35 });
    if (reduced || count === 0) gsap.set(body, { scale: s });
    else gsap.fromTo(body, { scaleX: s * 1.1, scaleY: s * 0.88 }, { scaleX: s, scaleY: s, duration: 0.9, ease: 'elastic.out(1.2, 0.35)' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, reduced]);

  const popBalloon = (k: number, el: HTMLElement) => {
    if (popped[k] || busy.current.has(k) || phase !== 'globos') return;
    busy.current.add(k);
    if (!started.current) { started.current = true; onStart(); } // el primer toque desbloquea el audio
    pop();
    const r = el.getBoundingClientRect();
    confetti({
      particleCount: 26, spread: 80, startVelocity: 26, scalar: 0.9, ticks: 110,
      origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.35) / window.innerHeight },
      colors: [BALLOONS[k].color, '#FFFFFF', BALLOONS[k].color], disableForReducedMotion: true,
    });
    const mark = () => setPopped((prev) => prev.map((v, j) => v || j === k));
    if (reduced) mark();
    else {
      gsap.timeline({ onComplete: mark })
        .to(el, { scale: 1.25, duration: 0.07, ease: 'power1.out' })
        .to(el, { scale: 0, opacity: 0, duration: 0.12, ease: 'power2.in' });
    }
    window.setTimeout(() => puff(0.18), 120);
  };

  // Cuando se reventaron todos: sobre listo
  useEffect(() => {
    if (phase !== 'globos' || count < BALLOONS.length) return;
    const t = window.setTimeout(() => {
      setPhase('listo');
      squeak();
      const body = q('.env-body');
      if (body && !reduced) gsap.fromTo(body, { y: 0 }, { y: -24, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 });
    }, reduced ? 0 : 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, phase, reduced]);

  const open = () => {
    if (phase !== 'listo') return;
    setPhase('abriendo');
    const body = q('.env-body');
    const r = body?.getBoundingClientRect();
    if (r) setOrigin({ x: r.left + r.width / 2, y: r.top + r.height * 0.45 });
    if (reduced || !body) { setPhase('invitado'); return; }

    pop();
    const letter = q('.env-letter');
    const stage = q('.env-stage');
    gsap.killTweensOf(q('.env-float'));
    const tl = gsap.timeline({ onComplete: () => setPhase('invitado') });
    tl.to(q('.env-seal'), { scale: 1.8, opacity: 0, duration: 0.25, ease: 'power2.out' })
      .set(q('.env-full'), { opacity: 0 })
      .set(q('.env-open'), { opacity: 1 })
      .set(letter, { visibility: 'visible' })
      .fromTo(body, { scaleX: 1.08, scaleY: 0.9 }, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' }, '<')
      .add(() => puff(), '<')
      .to(letter, { yPercent: -80, duration: 0.8, ease: 'back.out(1.5)' }, '-=0.35')
      // La cámara se acerca a la carta…
      .add(() => {
        const lr = letter?.getBoundingClientRect();
        const sr = stage?.getBoundingClientRect();
        if (stage && lr && sr) gsap.set(stage, { transformOrigin: `${lr.left + lr.width / 2 - sr.left}px ${lr.top + lr.height / 2 - sr.top}px` });
      }, '+=0.3')
      .to('.intro-ui', { opacity: 0, duration: 0.25 })
      .to(stage, { scale: 2.6, filter: 'blur(3px)', duration: 0.75, ease: 'power3.in' }, '<');
  };

  // "Estás invitado": confeti y textos que entran
  useEffect(() => {
    if (phase !== 'invitado' || !titleRef.current) return;
    squeak(0.15);
    confetti({ particleCount: 90, spread: 100, origin: { y: 0.45 }, colors: CONFETTI, disableForReducedMotion: true });
    if (!reduced) {
      gsap.fromTo(titleRef.current.querySelectorAll('.after'), { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.12, delay: 0.5,
      });
    }
  }, [phase, reduced]);

  if (phase === 'invitado') {
    return (
      <div ref={titleRef} className="screen screen-center gap-6 text-center">
        {/* Los 4 globos "vuelven" junto con el resto de la fiesta, saliendo del sobre */}
        <Floaties wander enterFrom={origin} items={[
          { img: 'globos/globo-rosa', x: '4%', y: '1%', size: 78, rot: -8 },
          { img: 'globos/flor', x: '30%', y: '-3%', size: 84, rot: -10 },
          { img: 'shapes-crown', x: '62%', y: '0%', size: 80, rot: 12 },
          { img: 'globos/globo-amarillo', x: '82%', y: '6%', size: 72, rot: 8 },
          { img: 'globos/globo-azul', x: '-5%', y: '36%', size: 70, rot: -6 },
          { img: 'globos/globo-plata', x: '84%', y: '36%', size: 80, rot: 6 },
          { img: 'shapes-hearts', x: '-6%', y: '62%', size: 80, rot: -8 },
          { img: 'lifestyle-glasses', x: '82%', y: '62%', size: 78, rot: 14 },
          { img: 'globos/cerdito', x: '2%', y: '80%', size: 86, rot: 6 },
          { img: 'lifestyle-trumpet', x: '34%', y: '86%', size: 84, rot: -12 },
          { img: 'globos/perrito', x: '66%', y: '80%', size: 118, rot: -6 },
        ]} />
        {config.titulos.invitado ? (
          <BalloonTitle
            text={i.titulo}
            img={config.titulos.invitado}
            fromScale={origin ? 1.35 : 0.2}
            className="h-[42svh] max-h-[460px] w-full max-w-[560px]"
            textClass="text-[clamp(56px,17vw,120px)]"
          />
        ) : (
          <BubbleWords text={i.titulo} className="text-inflated text-center text-[clamp(56px,17vw,120px)] leading-[0.95]" />
        )}
        <p className="after font-display text-[clamp(24px,7vw,34px)] leading-tight text-legible">{i.subtitulo}</p>
        <button className="after btn-balloon mt-4" onClick={onNext}>{i.cta2}</button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="screen screen-center overflow-hidden">
      <div className="env-stage relative z-10 flex w-[min(100%,720px)] flex-col items-center gap-6">
        {/* Globos para reventar: alrededor del sobre (en % del escenario, no de la pantalla) */}
        {BALLOONS.map((b, k) => !popped[k] && (
          <button
            key={b.img}
            type="button"
            aria-label={`Reventar globo ${k + 1} de ${BALLOONS.length}`}
            onClick={(e) => popBalloon(k, e.currentTarget)}
            className="balloon-btn absolute z-30 cursor-pointer"
            style={{ left: b.x, top: b.y, width: `clamp(72px, ${b.w}vw, ${b.w * 6}px)` }}
          >
            <span className="balloon-float block" style={{ transform: `rotate(${b.rot}deg)` }}>
                <img {...toyImg(b.img, `(min-width: 768px) ${b.w * 6}px, ${b.w}vw`)} alt="" draggable={false}
                  className="w-full drop-shadow-[0_14px_18px_rgba(10,31,68,0.22)]" />
            </span>
          </button>
        ))}


        <p className="intro-ui font-dot text-lg font-black uppercase text-legible">
          {config.evento.marca} · {config.evento.vol}
        </p>

        <div className="env-float relative w-[min(76vw,380px)]">
          {/* La carta: sube desde detrás del sobre */}
          <div className="env-letter invisible absolute inset-x-[14%] top-[16%] z-0 flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-2xl bg-white p-3 shadow-xl">
            <p className="font-dot text-[10px] font-black uppercase text-balloon">{config.evento.marca}</p>
            {config.titulos.invitado
              ? <img src={config.titulos.invitado} alt="" className="w-[92%]" />
              : <p className="font-display text-xl text-ink">{i.titulo}</p>}
          </div>

          <button
            type="button"
            onClick={open}
            disabled={phase !== 'listo'}
            aria-label={phase === 'listo' ? 'Abrir la invitación' : 'Sobre: revienta los globos para inflarlo'}
            className="env-body relative z-10 block w-full disabled:cursor-default"
          >
            <img {...SOBRE('desinflado')} alt="" draggable={false} className="env-flat w-full" />
            <img {...SOBRE('inflado')} alt="" draggable={false} className="env-full absolute inset-0 w-full opacity-0" />
            <img {...SOBRE('abierto')} alt="" draggable={false} className="env-open absolute inset-0 w-full opacity-0" />
            {/* Sello de plastilina en la punta de la solapa */}
            <img {...toyImg('shapes-star', '90px')} alt="" draggable={false}
              className={`env-seal absolute left-1/2 top-[45%] w-[20%] -translate-x-1/2 -translate-y-1/2 drop-shadow-lg transition-opacity duration-500 ${phase === 'globos' ? 'opacity-0' : 'opacity-100'}`} />
          </button>
        </div>

        <div className="intro-ui flex min-h-[72px] flex-col items-center gap-2">
          {phase === 'globos' ? (
            <>
              <p className="rounded-full bg-white px-5 py-2.5 text-base font-extrabold text-ink shadow-[0_8px_18px_rgba(10,31,68,0.15)]">
                {i.reventar}
              </p>
              <div className="flex gap-1.5" role="img" aria-label={`${count} de ${BALLOONS.length} globos reventados`}>
                {BALLOONS.map((b, k) => (
                  <span key={b.img} className="h-2.5 w-2.5 rounded-full border-2 border-white transition-colors"
                    style={{ background: popped[k] ? b.color : 'transparent' }} />
                ))}
              </div>
            </>
          ) : phase === 'listo' ? (
            <button type="button" onClick={open}
              className="animate-bounce rounded-full bg-white px-5 py-2.5 text-base font-extrabold text-ink shadow-[0_8px_18px_rgba(10,31,68,0.15)]">
              {i.cta}
            </button>
          ) : null}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{phase === 'listo' ? 'El sobre está listo: tócalo para abrir la invitación.' : ''}</p>
    </div>
  );
}
