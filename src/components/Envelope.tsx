import { forwardRef, type ReactNode } from 'react';
import { plasticine } from '../lib/motion';

// Sobre "inflado" (mecánica basada en Ephemera, MIT): solapa con clip-path que rota en X y carta que sube.
// La animación la maneja IntroScreen con GSAP usando las clases .env-flap, .env-letter, .env-seal.
export const Envelope = forwardRef<HTMLButtonElement, { to: string; onOpen: () => void; disabled?: boolean; children: ReactNode }>(
  function Envelope({ to, onOpen, disabled, children }, ref) {
    const paper = 'radial-gradient(130% 120% at 30% 15%, #ff9db0 0%, #ff4d6d 50%, #d9264a 100%)';
    return (
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        disabled={disabled}
        aria-label="Abrir la invitación"
        className="env relative block w-[min(82vw,340px)] [perspective:1400px]"
        style={{ aspectRatio: '1.45' }}
      >
        {/* Carta (sale hacia arriba al abrir) */}
        <div className="env-letter absolute inset-x-[7%] top-[8%] bottom-[10%] rounded-2xl bg-white p-4 text-left shadow-lg">
          {children}
        </div>
        {/* Cuerpo del sobre (tapa la parte de abajo de la carta) */}
        <div
          className="env-body absolute inset-0 rounded-[26px]"
          style={{
            background: paper,
            clipPath: 'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)',
            boxShadow: 'inset 0 -10px 24px rgb(0 0 0 / .18)',
          }}
        />
        <span className="env-to absolute bottom-[12%] left-0 right-0 text-center font-display text-2xl text-white drop-shadow">
          {to}
        </span>
        {/* Solapa */}
        <div
          className="env-flap absolute inset-x-0 top-0 h-[58%] origin-top rounded-t-[26px]"
          style={{
            background: 'radial-gradient(120% 120% at 50% 0%, #ffb3c1 0%, #ff6b85 60%, #e23a5c 100%)',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            filter: 'drop-shadow(0 6px 6px rgb(0 0 0 / .15))',
            backfaceVisibility: 'hidden',
          }}
        />
        {/* Sello de plastilina */}
        <img
          src={plasticine('shapes-star')}
          alt=""
          className="env-seal absolute left-1/2 top-[44%] w-[24%] -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
        />
      </button>
    );
  },
);
