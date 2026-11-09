import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { Share2 } from 'lucide-react';
import { config } from '../config';
import AdmitOneTicket, { TICKET_LAYOUT, TICKET_TEXTURE, playShutterSound } from '../components/ui/admit-one-ticket';
import { fullName } from '../lib/api';
import { formatNumero, prefersReducedMotion } from '../lib/motion';
import { isMuted } from '../lib/sfx';
import type { Guest } from '../types';
import { Floaties } from '../components/Floaties';

// Paleta globo para el ticket (en vez del naranja original).
const TEXTURE = {
  ...TICKET_TEXTURE,
  colorBack: '#FF4D6D',
  colorFront: '#FFB3C1',
  colorHighlight: '#FF8FA3',
  shape: 'warp' as const,
  speed: 0.35,
};
const LAYOUT = { ...TICKET_LAYOUT, inkColor: '#0A1F44', watermarkColor: '#FFD6DE', watermarkOpacity: 0.7 };

// Pantalla 6: la entrada generada con el nombre del invitado y su número.
export function TicketScreen({ guest, yaExistia = false, onNext }: { guest: Guest; yaExistia?: boolean; onNext: () => void }) {
  const e = config.evento;
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(340);
  const [shared, setShared] = useState(false);
  const numero = formatNumero(guest.numero);

  useEffect(() => {
    const update = () => setWidth(Math.min(window.innerWidth - 32, 560));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!isMuted()) playShutterSound({ volume: 0.4 });
    confetti({ particleCount: 70, spread: 90, origin: { y: 0.35 }, colors: ['#FF4D6D', '#FFFFFF', '#4BB1F8', '#FFD43B'], disableForReducedMotion: true });
    if (!ref.current || prefersReducedMotion()) return;
    // La entrada sale "impresa" de arriba hacia abajo
    const ctx = gsap.context(() => {
      // (al terminar se quita la máscara: si no, recorta el ticket cuando se inclina con el cursor)
      gsap.fromTo('.ticket-wrap', { clipPath: 'inset(-10% -10% 110% -10%)', y: -30 }, {
        clipPath: 'inset(-10% -10% -10% -10%)', y: 0, duration: 1.1, ease: 'power3.out', delay: 0.15, clearProps: 'clipPath',
      });
      gsap.fromTo('.after', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08, delay: 1 });
    }, ref);
    return () => ctx.revert();
  }, []);

  const share = async () => {
    const text = `Tengo mi entrada ${numero} para ${config.ticket.marca}. ¿Tú?`;
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: config.ticket.marca, text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setShared(true); }
    } catch { /* el usuario canceló */ }
  };

  return (
    <div ref={ref} className="screen justify-center gap-5">
      <Floaties items={[
        { img: 'nature-mushrooms', x: '76%', y: '88%', size: 96 },
        { img: 'globos/perrito', x: '-10%', y: '87%', size: 104 },
      ]} />
      <h2 className="text-inflated text-center text-[clamp(44px,13vw,64px)] leading-none md:text-[88px]">{config.ticket.titulo}</h2>
      {yaExistia && <p className="-mt-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink">Ya tenías entrada con ese email. Aquí está otra vez.</p>}

      <div className="ticket-wrap drop-shadow-[0_18px_30px_rgba(10,31,68,0.28)]">
        <AdmitOneTicket
          width={width}
          name={fullName(guest)}
          presenter={config.ticket.marca}
          event={config.ticket.evento}
          venue={e.direccion}
          dates={e.fechaCorta}
          stubText={numero || config.ticket.stub}
          watermark="v0"
          texture={TEXTURE}
          layout={LAYOUT}
        />
      </div>

      <p className="after max-w-[420px] text-center text-base font-extrabold text-legible">
        {config.ticket.dressCode}
      </p>
      {config.email.activo && (
        <p className="after max-w-[420px] text-center text-sm font-semibold text-legible">
          También te la mandamos a <span className="font-extrabold">{guest.email}</span>.
        </p>
      )}
      <p className="after max-w-[420px] text-center text-sm font-semibold text-legible">Haz una captura para tenerla a mano.</p>

      <div className="after flex flex-wrap justify-center gap-3">
        <button className="btn-ghost" onClick={share}>
          <Share2 size={18} /> {shared ? 'Link copiado' : 'Compartir'}
        </button>
        <button className="btn-balloon" onClick={onNext}>Ver datos de la fiesta</button>
      </div>
    </div>
  );
}
