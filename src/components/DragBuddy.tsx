import { useEffect, useRef } from 'react';
import { makeThrowable } from '../lib/drag';
import { toyImg } from '../lib/motion';

// Personaje pegado a una parte de la página (no flota por la pantalla) que se puede arrastrar y lanzar.
// El div de afuera recibe el arrastre; la imagen de adentro se balancea (así no chocan las animaciones).
export function DragBuddy({ img, sizes, className = '', imgClass = '' }: {
  img: string;
  sizes: string;
  /** Posición y ancho del personaje (clases de Tailwind) */
  className?: string;
  imgClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const [drag] = makeThrowable(ref.current, {
      bounds: window, // al lanzarlo no se escapa de la pantalla
      onGrab: (el) => { el.style.zIndex = '40'; },
      onRest: (el) => { el.style.zIndex = ''; },
    });
    return () => { drag.kill(); };
  }, []);

  return (
    <div ref={ref} aria-hidden className={`drag-self absolute cursor-grab touch-none select-none active:cursor-grabbing ${className}`}>
      <img {...toyImg(img, sizes)} alt="" draggable={false} className={`anim-bob w-full ${imgClass}`} />
    </div>
  );
}
