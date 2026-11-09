import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { BubbleWords } from './BubbleWords';
import { prefersReducedMotion } from '../lib/motion';
import { squeak } from '../lib/sfx';

gsap.registerPlugin(Draggable);

// Título en letras globo. Prioridad: imagen (IA) → texto inflado con CSS.
export function BalloonTitle({ text, img, className = '', textClass = '', fromScale = 0.2 }: {
  text: string;
  img?: string;
  className?: string;
  textClass?: string;
  /** Escala inicial de la entrada (0.2 = se infla desde chico; ~1.2 = viene de un acercamiento de cámara) */
  fromScale?: number;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  // Imagen: entra inflándose, flota y se puede arrastrar (vuelve a su lugar con rebote).
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.fromTo(el, { scale: fromScale, rotation: fromScale < 1 ? -8 : 0 }, { scale: 1, rotation: 0, duration: fromScale < 1 ? 1.3 : 0.9, ease: fromScale < 1 ? 'elastic.out(1, 0.4)' : 'power3.out' });
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


  const fallback = <BubbleWords text={text} className={`text-inflated text-center leading-[0.95] ${textClass}`} />;

  if (img) {
    return (
      <div className={`grid place-items-center ${className}`}>
        <img ref={imgRef} src={img} alt={text} draggable={false} className="drag-self max-h-full w-full cursor-grab touch-none select-none object-contain drop-shadow-[0_20px_30px_rgba(10,31,68,0.25)]" />
      </div>
    );
  }
  return <div className={`grid place-items-center ${className}`}>{fallback}</div>;
}
