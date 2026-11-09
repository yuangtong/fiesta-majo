import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../lib/motion';

// Cielo con nubes infladas. El degradado es CSS (body); la imagen aporta las nubes.
// TODO: usar la versión vertical (y nubes sueltas) cuando estén generadas.
export function Sky() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const tween = gsap.to(ref.current, { backgroundPosition: '52% 46%', duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    return () => { tween.kill(); };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{
        backgroundImage: 'url(/images/fondo/cielo-nubes-horizontal.webp)',
        backgroundSize: 'cover',
        backgroundPosition: '48% 50%',
      }}
    />
  );
}
