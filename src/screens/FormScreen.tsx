import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft } from 'lucide-react';
import { config } from '../config';
import { submitRSVP } from '../lib/api';
import { prefersReducedMotion } from '../lib/motion';
import { pop, puff } from '../lib/sfx';
import type { Guest } from '../types';
import { Floaties } from '../components/Floaties';

type Step = 0 | 1 | 2;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pantalla 5: tus datos, una pregunta por pantalla (nombre → email → canción). Al final genera la entrada.
export function FormScreen({ guest, onChange, onDone }: {
  guest: Guest;
  onChange: (data: Partial<Guest>) => void;
  onDone: (numero: number | null, yaExistia?: boolean) => void;
}) {
  const f = config.formulario;
  const [step, setStep] = useState<Step>(0);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInput.current?.focus({ preventScroll: true });
    if (!panelRef.current || prefersReducedMotion()) return;
    gsap.fromTo(panelRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
  }, [step]);

  const shake = () => {
    if (!panelRef.current || prefersReducedMotion()) return;
    gsap.fromTo(panelRef.current, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.5, 0.3)' });
  };

  const validate = (): string => {
    if (step === 0) {
      if (guest.nombre.trim().length < 2) return 'Escribe tu nombre (mínimo 2 letras).';
      if (guest.apellido.trim().length < 2) return 'Escribe tu apellido (mínimo 2 letras).';
    }
    if (step === 1 && !EMAIL_RE.test(guest.email.trim())) return 'Ese email no parece válido. Revisa que tenga @ y un dominio.';
    return '';
  };

  const next = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const msg = validate();
    if (msg) { setError(msg); shake(); return; }
    setError('');
    if (step < 2) { puff(); setStep((step + 1) as Step); return; }

    setSending(true);
    const result = await submitRSVP(guest);
    setSending(false);
    if (result.status === 'ok') { pop(); onDone(result.numero); return; }
    if (result.status === 'duplicate' && result.numero) { pop(); onDone(result.numero, true); return; }
    if (result.status === 'duplicate') {
      setStep(1);
      setError('Ese email ya tiene entrada.');
    } else {
      setError('No se pudo generar la entrada. Revisa tu conexión e inténtalo otra vez.');
    }
    shake();
  };

  const back = () => { setError(''); setStep((s) => Math.max(0, s - 1) as Step); };
  const titleId = `paso-${step}`;

  return (
    <form onSubmit={next} noValidate className="screen justify-center gap-6">
      <Floaties items={[
        { img: 'lifestyle-trumpet', x: '70%', y: '4%', size: 120, rot: -8 },
        { img: 'nature-cat', x: '-6%', y: '82%', size: 110, rot: -8 },
        { img: 'shapes-cube', x: '80%', y: '80%', size: 80, rot: 12 },
      ]} />
      {/* Progreso: 3 globos que se inflan */}
      <div className="flex w-full max-w-[420px] items-center gap-3" aria-label={`Paso ${step + 1} de 3`}>
        {step > 0 && (
          <button type="button" onClick={back} aria-label="Volver" className="grid h-11 w-11 place-items-center rounded-full bg-white/85 text-ink">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block rounded-full transition-all duration-500"
              style={{
                width: i === step ? 34 : 14, height: 14,
                background: i <= step ? 'radial-gradient(120% 140% at 30% 25%, #ff8fa3, #ff4d6d 50%, #d9264a)' : 'rgb(255 255 255 / .6)',
              }}
            />
          ))}
        </div>
      </div>

      <div ref={panelRef} className="flex w-full max-w-[420px] flex-col gap-4">
        <h2 id={titleId} className="text-inflated text-[clamp(38px,11vw,54px)] leading-[0.95]">{f.pasos[step].titulo}</h2>

        {step === 0 && (
          <>
            <input ref={firstInput} className="field" placeholder="Nombre" autoComplete="given-name" aria-labelledby={titleId}
              value={guest.nombre} onChange={(e) => onChange({ nombre: e.target.value })} />
            <input className="field" placeholder="Apellido" autoComplete="family-name" aria-label="Apellido"
              value={guest.apellido} onChange={(e) => onChange({ apellido: e.target.value })} />
          </>
        )}
        {step === 1 && (
          <>
          <input ref={firstInput} className="field" type="email" inputMode="email" placeholder="tu@email.com" autoComplete="email"
            aria-labelledby={titleId} value={guest.email} onChange={(e) => onChange({ email: e.target.value })} />
          <p className="text-sm font-semibold text-legible">{f.pasos[1].nota}</p>
          </>
        )}
        {step === 2 && (
          <>
            <input ref={firstInput} className="field" placeholder="Artista – canción" aria-labelledby={titleId} maxLength={200}
              value={guest.cancion} onChange={(e) => onChange({ cancion: e.target.value })} />
            <p className="text-sm font-semibold text-legible">Opcional. Con esto armamos la playlist de la noche.</p>
          </>
        )}

        <p role="alert" className="min-h-[1.5rem] rounded-xl text-sm font-bold text-ink">
          {error && <span className="inline-block rounded-xl bg-white px-3 py-2">{error}</span>}
        </p>
      </div>

      <button type="submit" className="btn-balloon w-full max-w-[420px]" disabled={sending}>
        {sending ? 'Generando tu entrada…' : step < 2 ? 'Siguiente' : f.enviar}
      </button>
    </form>
  );
}
