import { useCallback, useRef, useState } from 'react';
import { Route, Routes } from 'react-router';
import { gsap } from 'gsap';
import { config } from './config';
import type { Answers, Screen } from './types';
import { useAudio } from './hooks/useAudio';
import { useStats } from './hooks/useStats';
import { AudioToggle } from './components/AudioToggle';
import { LoaderScreen } from './screens/LoaderScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { VoteScreen } from './screens/VoteScreen';
import { SpectrumScreen } from './screens/SpectrumScreen';
import { FormScreen } from './screens/FormScreen';
import { InfoScreen } from './screens/InfoScreen';
import AdminScreen from './pages/AdminScreen';

// Flujo: loader → bienvenida → pregunta 1 (voto) → pregunta 2 (espectro) → formulario → info.
const INITIAL: Answers = {
  nombre: '',
  apellido: '',
  email: '',
  extra: '',
  regalo: true,
  voto: null,
  espectro: config.pregunta2.valorInicial,
};

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminScreen />} />
      <Route path="*" element={<Invitation />} />
    </Routes>
  );
}

function Invitation() {
  const { voteStats, spectrumStats } = useStats();
  const { enabled: audioOn, play, toggle, playSfx } = useAudio();
  const [screen, setScreen] = useState<Screen>('loader');
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [transitioning, setTransitioning] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  const update = useCallback((data: Partial<Answers>) => setAnswers((p) => ({ ...p, ...data })), []);

  // Transición entre pantallas: overlay breve + la nueva pantalla entra desde la derecha.
  const go = useCallback((next: Screen) => {
    playSfx('tap');
    setTransitioning(true);
    setTimeout(() => {
      setScreen(next);
      setTransitioning(false);
      if (screenRef.current) {
        gsap.fromTo(screenRef.current, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
      }
    }, 150);
  }, [playSfx]);

  const render = () => {
    switch (screen) {
      case 'loader':
        return <LoaderScreen onComplete={() => { play(); go('welcome'); }} />;
      case 'welcome':
        return <WelcomeScreen onStart={() => go('q1-vote')} />;
      case 'q1-vote':
        return (
          <VoteScreen
            selected={answers.voto}
            stats={voteStats}
            onVote={(voto) => { playSfx('tap'); update({ voto }); }}
            onNext={() => go('q2-spectrum')}
          />
        );
      case 'q2-spectrum':
        return (
          <SpectrumScreen
            value={answers.espectro}
            stats={spectrumStats}
            onChange={(espectro) => update({ espectro })}
            onNext={() => go('form')}
          />
        );
      case 'form':
        return (
          <FormScreen
            answers={answers}
            voteStats={voteStats}
            spectrumStats={spectrumStats}
            onSubmitted={(data) => { playSfx('success'); update(data); }}
            onDone={() => go('info')}
          />
        );
      case 'info':
        return <InfoScreen answers={answers} />;
    }
  };

  return (
    <div className="flex h-full w-full justify-center">
      <div className="relative h-full w-full max-w-[480px] overflow-hidden">
        <div ref={screenRef} className="relative h-full w-full">{render()}</div>
        <div className={`pointer-events-none absolute inset-0 z-40 bg-zinc-900 transition-opacity duration-150 ${transitioning ? 'opacity-30' : 'opacity-0'}`} />
        {screen !== 'loader' && <AudioToggle enabled={audioOn} onToggle={toggle} />}
      </div>
    </div>
  );
}
