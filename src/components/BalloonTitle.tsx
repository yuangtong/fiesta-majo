import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import type { Application } from '@splinetool/runtime';
import { SplineScene } from './SplineScene';
import { BubbleWords } from './BubbleWords';
import { prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

gsap.registerPlugin(Draggable);

// Título en letras globo. Prioridad: imagen (IA) → escena Spline → texto inflado con CSS.
export function BalloonTitle({ text, img, spline, className = '', textClass = '' }: {
  text: string;
  img?: string;
  spline?: string;
  className?: string;
  textClass?: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  // Imagen: entra inflándose, flota y se puede arrastrar (vuelve a su lugar con rebote).
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.fromTo(el, { scale: 0.2, rotation: -8 }, { scale: 1, rotation: 0, duration: 1.3, ease: 'elastic.out(1, 0.4)' });
        gsap.to(el, { y: -10, rotation: 1.5, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.3 });
      }
      Draggable.create(el, {
        onPress() { squeak(); gsap.to(el, { scale: 1.06, duration: 0.2 }); },
        onRelease() {
          gsap.to(el, { x: 0, y: 0, scale: 1, duration: reduced ? 0 : 1, ease: 'elastic.out(1.1, 0.35)' });
        },
      });
    });
    return () => ctx.revert();
  }, [img]);

  const onSplineReady = (app: Application) => {
    squeak(0.3);
    if (prefersReducedMotion()) return;
    app.getAllObjects().filter((o) => /^(club|inv)-/.test(o.name)).forEach((o, i) => {
      const s = { ...o.scale };
      const v = { k: 0 };
      gsap.to(v, {
        k: 1, duration: 0.9, delay: 0.1 + i * 0.05, ease: 'elastic.out(1, 0.45)',
        onUpdate: () => { o.scale.x = s.x * v.k; o.scale.y = s.y * v.k; o.scale.z = s.z * v.k; },
      });
    });
  };

  const fallback = <BubbleWords text={text} className={`text-inflated text-center leading-[0.95] ${textClass}`} />;

  if (img) {
    return (
      <div className={`grid place-items-center ${className}`}>
        <img ref={imgRef} src={img} alt={text} draggable={false} className="max-h-full w-full cursor-grab touch-none select-none object-contain drop-shadow-[0_20px_30px_rgba(10,31,68,0.25)]" />
      </div>
    );
  }
  if (spline) return <SplineScene scene={spline} onReady={onSplineReady} interactive className={className} fallback={fallback} />;
  return <div className={`grid place-items-center ${className}`}>{fallback}</div>;
}
