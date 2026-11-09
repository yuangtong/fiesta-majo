import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Calendar, Copy, Gift, Mail, MapPin, Music, Share2 } from 'lucide-react';
import { config } from '../config';
import { copyLink, downloadICS, mapsUrl, shareWhatsApp } from '../lib/actions';
import { resendConfirmation } from '../lib/api';
import { prefersReducedMotion } from '../lib/motion';
import { Modal } from '../components/Modal';
import { CrossedGift } from '../components/CrossedGift';
import type { Guest } from '../types';

// Pantalla 7: todos los datos de la fiesta y acciones útiles.
export function InfoScreen({ guest, total }: { guest: Guest; total: number | null }) {
  const e = config.evento;
  const info = config.info;
  const ref = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.fromTo(ref.current.children, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' });
  }, []);

  const resend = async () => {
    if (!guest.email || emailState === 'sending') return;
    setEmailState('sending');
    try {
      const res = await resendConfirmation(guest.email);
      setEmailState(res.ok ? 'sent' : 'error');
    } catch {
      setEmailState('error');
    }
  };

  const copy = async () => {
    await copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div ref={ref} className="mx-auto flex w-full max-w-[460px] flex-col gap-4 px-5 pb-24 pt-10">
        <div className="flex flex-col items-start gap-1.5 font-dot font-black uppercase">
          <span className="bg-white px-2 text-lg text-ink">{e.marca}</span>
          <span className="bg-ink px-2 text-[clamp(34px,10vw,46px)] leading-none text-white">{e.edicion}</span>
          <span className="bg-balloon px-2 text-xl text-white">{e.nombre}</span>
        </div>

        <section className="panel">
          <p className="font-display text-[34px] leading-none text-balloon">{e.fechaLarga}</p>
          <p className="mt-1 font-dot text-lg font-black uppercase">{e.hora}</p>
          {total !== null && total > 0 && <p className="mt-3 text-sm font-semibold text-ink/70">{total} personas ya tienen entrada.</p>}
        </section>

        <section className="panel">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-ink/60"><MapPin size={16} /> Dónde</h3>
          <p className="text-xl font-extrabold">{e.direccion}</p>
          <p className="mb-4 text-sm text-ink/70">{e.referencia}</p>
          <a className="btn-balloon w-full" href={mapsUrl()} target="_blank" rel="noreferrer">Abrir en Google Maps</a>
        </section>

        <section className="panel flex items-center gap-4">
          <CrossedGift size={70} />
          <div>
            <h3 className="text-sm font-extrabold text-ink/60">Dress code</h3>
            <p className="font-display text-2xl leading-tight text-balloon">{config.tematica.titulo}</p>
            <p className="text-sm">{config.tematica.texto}</p>
          </div>
        </section>

        <section className="panel">
          <h3 className="mb-3 text-sm font-extrabold text-ink/60">Reglas de la casa</h3>
          <ol className="space-y-2">
            {info.reglas.map((r, i) => (
              <li key={r} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-balloon text-sm font-extrabold text-white">{i + 1}</span>
                <span className="pt-0.5">{r}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid grid-cols-2 gap-3">
          {info.playlist.url && (
            <a className="btn-ghost" href={info.playlist.url} target="_blank" rel="noreferrer"><Music size={18} /> Playlist</a>
          )}
          {info.yape.qrImagen && (
            <button className="btn-ghost" onClick={() => setQr(true)}><Gift size={18} /> Colaborar</button>
          )}
          <button className="btn-ghost" onClick={downloadICS}><Calendar size={18} /> Calendario</button>
          <button className="btn-ghost" onClick={shareWhatsApp}><Share2 size={18} /> WhatsApp</button>
          <button className="btn-ghost" onClick={copy}><Copy size={18} /> {copied ? '¡Copiado!' : 'Copiar link'}</button>
          {guest.email && (
            <button className="btn-ghost" onClick={resend} disabled={emailState === 'sending'}>
              <Mail size={18} />
              {emailState === 'sending' ? 'Enviando…' : emailState === 'sent' ? 'Enviado' : emailState === 'error' ? 'Reintentar' : 'Reenviar email'}
            </button>
          )}
        </div>
      </div>

      <Modal open={qr} onClose={() => setQr(false)} title={info.yape.texto}>
        <img src={info.yape.qrImagen} alt="Código QR para colaborar" className="w-full rounded-lg" />
      </Modal>
    </div>
  );
}
