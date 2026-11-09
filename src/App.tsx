import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router';
import { gsap } from 'gsap';
import type { Guest, Screen } from './types';
import { useAudio } from './hooks/useAudio';
import { useStats } from './hooks/useStats';
import { prefersReducedMotion } from './lib/motion';
import { Sky } from './components/Sky';
import { AudioToggle } from './components/AudioToggle';
import { IntroScreen } from './screens/IntroScreen';
import { ClubScreen } from './screens/ClubScreen';
import { RuletaScreen } from './screens/RuletaScreen';
import { TematicaScreen } from './screens/TematicaScreen';
import { FormScreen } from './screens/FormScreen';
import { TicketScreen } from './screens/TicketScreen';
import { InfoScreen } from './screens/InfoScreen';
import AdminScreen from './pages/AdminScreen';

// Flujo: sobre → "Estás invitado" → Huamanga Club presenta → ruleta → temática → datos → entrada → info.
const INITIAL: Guest = { nombre: '', apellido: '', email: '', cancion: '', numero: null };

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminScreen />} />
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
  const [yaExistia, setYaExistia] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const entering = useRef(false);

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
        return <FormScreen guest={guest} onChange={update} onDone={(numero, existia) => { update({ numero }); setYaExistia(!!existia); go('ticket'); }} />;
      case 'ticket':
        return <TicketScreen guest={guest} yaExistia={yaExistia} onNext={() => go('info')} />;
      case 'info':
        return <InfoScreen guest={guest} total={total} />;
    }
  };

  return (
    <main className="relative h-full w-full overflow-hidden">
      <Sky />
      <div ref={screenRef} data-passthrough className="relative h-full w-full">{render()}</div>
      {started && <AudioToggle enabled={audioOn} onToggle={toggle} />}
    </main>
  );
}
