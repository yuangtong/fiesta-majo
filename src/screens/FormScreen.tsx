import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { config } from '../config';
import { submitRSVP } from '../lib/api';
import { VoteBars } from '../components/VoteBars';
import { SpectrumChart } from '../components/SpectrumChart';
import type { Answers, SpectrumStats, VoteStats } from '../types';

type Errors = Partial<Record<'nombre' | 'apellido' | 'email' | 'extra' | 'regalo', string>>;
type Phase = 'form' | 'celebration' | 'results';

// Pregunta 3: datos reales → valida → guarda en Supabase vía /api/rsvp (rechaza emails repetidos)
// → el servidor manda el email → celebración con confetti → resultados acumulados → info de la fiesta.
export function FormScreen({ answers, voteStats, spectrumStats, onSubmitted, onDone }: {
  answers: Answers;
  voteStats: VoteStats;
  spectrumStats: SpectrumStats;
  onSubmitted: (data: Partial<Answers>) => void;
  onDone: () => void;
}) {
  const f = config.formulario;
  const [nombre, setNombre] = useState(answers.nombre);
  const [apellido, setApellido] = useState(answers.apellido);
  const [email, setEmail] = useState(answers.email);
  const [extra, setExtra] = useState(answers.extra);
  const [regalo, setRegalo] = useState(answers.regalo);
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<Phase>('form');
  const [submitting, setSubmitting] = useState(false);
  const celebrationRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const e: Errors = {};
    if (nombre.trim().length < 2) e.nombre = 'Mínimo 2 caracteres';
    if (apellido.trim().length < 2) e.apellido = 'Mínimo 2 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Email inválido';
    if (!extra) e.extra = 'Elige una opción';
    if (!regalo) e.regalo = 'Es obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);

    const data = { nombre, apellido, email: email.trim(), extra, regalo };
    const result = await submitRSVP({ ...answers, ...data });
    if (result !== 'ok') {
      setErrors((p) => ({
        ...p,
        email: result === 'duplicate'
          ? 'Este email ya está registrado. ¿Ya confirmaste antes?'
          : 'No se pudo enviar. Revisa tu conexión e intenta otra vez.',
      }));
      setSubmitting(false);
      return;
    }
    onSubmitted(data);
    setSubmitting(false);
    setPhase('celebration');
  };

  useEffect(() => {
    if (phase !== 'celebration') return;
    const end = Date.now() + 2000;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    gsap.fromTo(celebrationRef.current, { scale: 0, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)',
      onComplete: () => { setTimeout(() => setPhase('results'), 800); },
    });
  }, [phase]);

  useEffect(() => {
    if (phase === 'results' && resultsRef.current) {
      gsap.fromTo(resultsRef.current.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: 'power3.out' });
    }
  }, [phase]);

  if (phase === 'celebration') {
    return (
      <div className="screen items-center justify-center">
        <div ref={celebrationRef} className="text-center" style={{ opacity: 0 }}>
          <h1 className="text-4xl font-bold">{f.celebracion.titulo}</h1>
          <p className="mt-3 text-zinc-500">{f.celebracion.subtitulo}</p>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="screen">
        <div ref={resultsRef} className="flex flex-col gap-4">
          <div className="text-center">
            <p className="label">Resultados acumulados</p>
            <p className="text-sm text-zinc-500">{voteStats.total} invitados han confirmado</p>
          </div>
          <div className="card">
            <p className="label mb-1">{config.pregunta1.titulo}</p>
            <p className="mb-3 text-xs italic text-zinc-400">{config.pregunta1.disclaimer}</p>
            <VoteBars stats={voteStats} highlight={answers.voto} />
          </div>
          <div className="card">
            <p className="label mb-2">{config.pregunta2.titulo}</p>
            <SpectrumChart stats={spectrumStats} userValue={answers.espectro} />
          </div>
          <button className="btn" onClick={onDone}>Ver datos de la fiesta</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="screen justify-center gap-4">
      <div>
        <p className="label">{f.etiqueta}</p>
        <p className="text-sm text-zinc-500">{f.subtitulo}</p>
      </div>

      <Field label="Nombre" error={errors.nombre}>
        <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="given-name" />
      </Field>
      <Field label="Apellido" error={errors.apellido}>
        <input className="input" value={apellido} onChange={(e) => setApellido(e.target.value)} autoComplete="family-name" />
      </Field>
      <Field label="Email" error={errors.email}>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </Field>

      <Field label={f.preguntaExtra.titulo} error={errors.extra}>
        <div className="flex flex-col gap-2">
          {f.preguntaExtra.opciones.map((o) => (
            <label key={o.value} className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 ${extra === o.value ? 'border-zinc-900' : 'border-zinc-300'}`}>
              <input type="radio" name="extra" value={o.value} checked={extra === o.value} onChange={() => setExtra(o.value)} />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field error={errors.regalo}>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={regalo} onChange={(e) => setRegalo(e.target.checked)} />
          {f.checkbox}
        </label>
      </Field>

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? 'Enviando…' : 'Confirmar asistencia'}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <p className="label mb-1.5">{label}</p>}
      {children}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
