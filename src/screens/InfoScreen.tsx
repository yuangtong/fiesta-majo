import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Calendar, Copy, Gift, Image, Mail, MapPin, Music, Share2 } from 'lucide-react';
import { config } from '../config';
import { copyLink, downloadICS, mapsUrl, shareWhatsApp } from '../lib/actions';
import { resendConfirmation } from '../lib/api';
import { Modal } from '../components/Modal';
import type { Answers } from '../types';

// Pantalla final con todos los datos y acciones: mapa, playlist, QR, calendario,
// reenviar email, compartir (con easter egg opcional) y copiar link.
export function InfoScreen({ answers }: { answers: Answers }) {
  const ev = config.evento;
  const info = config.info;
  const contentRef = useRef<HTMLDivElement>(null);
  const eggAudioRef = useRef<HTMLAudioElement | null>(null);
  const [modal, setModal] = useState<'qr' | 'gallery' | 'egg' | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
    }
  }, []);

  const handleResendEmail = async () => {
    if (!answers.email || emailState === 'sending') return;
    setEmailState('sending');
    try {
      const res = await resendConfirmation(answers.email);
      if (!res.ok) throw new Error();
      setEmailState('sent');
      setTimeout(() => setEmailState('idle'), 4000);
    } catch {
      setEmailState('idle');
    }
  };

  const handleShare = () => {
    if (!info.easterEgg.activo) return shareWhatsApp();
    setModal('egg');
    if (info.easterEgg.audio) {
      eggAudioRef.current ??= new Audio(info.easterEgg.audio);
      eggAudioRef.current.currentTime = 0;
      eggAudioRef.current.play().catch(() => {});
    }
  };

  const closeModal = () => {
    eggAudioRef.current?.pause();
    setModal(null);
  };

  const handleCopy = async () => {
    await copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div ref={contentRef} className="flex flex-col gap-4 px-5 py-8 pb-24">
        <div className="text-center">
          <p className="label">Datos de la fiesta</p>
          <h1 className="text-2xl font-bold">{ev.nombre}</h1>
          {answers.nombre && <p className="text-sm text-zinc-500">¡Nos vemos, {answers.nombre}!</p>}
        </div>

        <div className="card text-center">
          <p className="text-3xl font-bold">{ev.fechaCorta}</p>
          <p className="text-sm text-zinc-600">{ev.fechaLarga}</p>
        </div>

        <div className="card">
          <p className="label mb-2 flex items-center gap-1.5"><MapPin size={14} /> Dónde</p>
          <p className="font-semibold">{ev.direccion}</p>
          <p className="mb-3 text-xs text-zinc-500">{ev.referencia}</p>
          <a className="btn block text-center" href={mapsUrl()} target="_blank" rel="noreferrer">Ver en Google Maps</a>
        </div>

        <div className="card">
          <p className="label mb-2">Reglas</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            {info.reglas.map((r) => <li key={r}>{r}</li>)}
          </ol>
          <p className="mt-3 text-sm"><b>Dress code:</b> {info.dressCode}</p>
        </div>

        <div className="card">
          <p className="label mb-2">Vibe</p>
          <p className="text-sm">{info.vibe.texto}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {info.vibe.tags.map((t) => <span key={t} className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs">{t}</span>)}
          </div>
          {info.galeria.length > 0 && (
            <button className="btn-outline mt-3 flex items-center justify-center gap-2" onClick={() => setModal('gallery')}>
              <Image size={16} /> Ver inspiración
            </button>
          )}
        </div>

        {info.playlist.url && (
          <a className="btn-outline flex items-center justify-center gap-2" href={info.playlist.url} target="_blank" rel="noreferrer">
            <Music size={16} /> {info.playlist.nombre}
          </a>
        )}

        {info.yape.qrImagen && (
          <button className="btn-outline flex items-center justify-center gap-2" onClick={() => setModal('qr')}>
            <Gift size={16} /> {info.yape.texto}
          </button>
        )}

        <button className="btn-outline flex items-center justify-center gap-2" onClick={downloadICS}>
          <Calendar size={16} /> Agregar al calendario
        </button>

        {answers.email && (
          <button className="btn-outline flex items-center justify-center gap-2" onClick={handleResendEmail} disabled={emailState === 'sending'}>
            <Mail size={16} />
            {emailState === 'sending' ? 'Enviando…' : emailState === 'sent' ? `Enviado a ${answers.email}` : 'Reenviar email de confirmación'}
          </button>
        )}

        <button className="btn flex items-center justify-center gap-2" onClick={handleShare}>
          <Share2 size={16} /> Compartir por WhatsApp
        </button>

        <button className="btn-outline flex items-center justify-center gap-2" onClick={handleCopy}>
          <Copy size={16} /> {copied ? '¡Link copiado!' : 'Copiar link'}
        </button>
      </div>

      <Modal open={modal === 'qr'} onClose={closeModal} title="Colaboraciones">
        <img src={info.yape.qrImagen} alt="QR" className="w-full rounded-lg" />
      </Modal>

      <Modal open={modal === 'gallery'} onClose={closeModal} title="Inspiración">
        <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto">
          {info.galeria.map((src: string) => <img key={src} src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />)}
        </div>
      </Modal>

      <Modal open={modal === 'egg'} onClose={closeModal} title={info.easterEgg.texto}>
        {info.easterEgg.imagen && <img src={info.easterEgg.imagen} alt="" className="w-full rounded-lg" />}
        <button className="btn mt-4" onClick={() => { closeModal(); shareWhatsApp(); }}>Ahora sí, compartir</button>
      </Modal>
    </div>
  );
}
