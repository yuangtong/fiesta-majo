import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router';
import { gsap } from 'gsap';
import type { Guest, Screen } from './types';
import { useAudio } from './hooks/useAudio';
import { useStats } from './hooks/useStats';
import { prefersReducedMotion } from './lib/motion';
import { Sky } from './components/Sky';
import { AudioToggle } from './components/AudioToggle';
import { IntroScreen } from './screens/IntroScreen';
import { installPassthrough } from './lib/drag';

// Solo el inicio va en el JS inicial; el resto se descarga en segundo plano (ver prefetch) o al llegar.
const loaders = {
  club: () => import('./screens/ClubScreen'),
  ruleta: () => import('./screens/RuletaScreen'),
  tematica: () => import('./screens/TematicaScreen'),
  form: () => import('./screens/FormScreen'),
  ticket: () => import('./screens/TicketScreen'),
  info: () => import('./screens/InfoScreen'),
};
const ClubScreen = lazy(() => loaders.club().then((m) => ({ default: m.ClubScreen })));
const RuletaScreen = lazy(() => loaders.ruleta().then((m) => ({ default: m.RuletaScreen })));
const TematicaScreen = lazy(() => loaders.tematica().then((m) => ({ default: m.TematicaScreen })));
const FormScreen = lazy(() => loaders.form().then((m) => ({ default: m.FormScreen })));
const TicketScreen = lazy(() => loaders.ticket().then((m) => ({ default: m.TicketScreen })));
const InfoScreen = lazy(() => loaders.info().then((m) => ({ default: m.InfoScreen })));
const AdminScreen = lazy(() => import('./pages/AdminScreen'));

// Flujo: sobre → "Estás invitado" → Huamanga Club presenta → ruleta → temática → datos → entrada → info.
const INITIAL: Guest = { nombre: '', apellido: '', email: '', canciones: [''], numero: null };

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Suspense fallback={null}><AdminScreen /></Suspense>} />
      <Route path="*" element={<Invitation />} />
    </Routes>
  );
}

function Invitation() {
  const total = useStats();
  const { enabled: audioOn, start, toggle } = useAudio();
  const [screen, setScreen] = useState<Screen>('intro');
  const [guest, setGuest] = useState<Guest>(INITIAL);
  const [started, setStarted] = useState(false);
  const [yaExistia, setYaExistia] = useState<{ agregadas: number } | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const entering = useRef(false);

  // Agarrar nubes/juguetes tocando un espacio vacío (están detrás del contenido)
  useEffect(() => installPassthrough(), []);

  // Descargar las demás pantallas cuando el navegador esté libre, para que no haya espera al avanzar
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => Object.values(loaders).forEach((load) => { void load(); }));
  }, []);

  const update = useCallback((data: Partial<Guest>) => setGuest((g) => ({ ...g, ...data })), []);

  // Transición: la pantalla actual se "desinfla" y la nueva entra inflándose.
  const go = useCallback((next: Screen) => {
    const el = screenRef.current;
    if (!el || prefersReducedMotion()) { setScreen(next); return; }
    gsap.to(el, {
      scale: 0.94, opacity: 0, duration: 0.22, ease: 'power2.in',
      onComplete: () => { entering.current = true; setScreen(next); },
    });
  }, []);

  useLayoutEffect(() => {
    const el = screenRef.current;
    if (!el || !entering.current) return;
    entering.current = false;
    el.scrollTop = 0;
    gsap.fromTo(el, { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.6)' });
  }, [screen]);

  const render = () => {
    switch (screen) {
      case 'intro':
        return <IntroScreen onStart={() => { start(); setStarted(true); }} onNext={() => go('club')} />;
      case 'club':
        return <ClubScreen onNext={() => go('ruleta')} />;
      case 'ruleta':
        return <RuletaScreen onNext={() => go('tematica')} />;
      case 'tematica':
        return <TematicaScreen onNext={() => go('form')} />;
      case 'form':
        return <FormScreen guest={guest} onChange={update} onDone={(numero, existia) => { update({ numero }); setYaExistia(existia ?? null); go('ticket'); }} />;
      case 'ticket':
        return <TicketScreen guest={guest} yaExistia={yaExistia} onNext={() => go('info')} />;
      case 'info':
        return <InfoScreen guest={guest} total={total} />;
    }
  };

  return (
    <main className="relative h-full w-full overflow-hidden">
      <Sky />
      <div ref={screenRef} data-passthrough className="relative isolate h-full w-full"><Suspense fallback={null}>{render()}</Suspense></div>
      {started && <AudioToggle enabled={audioOn} onToggle={toggle} />}
    </main>
  );
}
