import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../lib/motion';

// Texto que aparece letra por letra "inflándose" (escala elástica). El texto sigue siendo texto real.
export function BubbleWords({ text, className = '', delay = 0, as: Tag = 'h1' }: {
  text: string; className?: string; delay?: number; as?: 'h1' | 'h2' | 'p';
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const chars = ref.current.querySelectorAll('.ch');
    const tween = gsap.fromTo(chars, { scale: 0, y: 30, rotation: () => gsap.utils.random(-25, 25) }, {
      scale: 1, y: 0, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', stagger: 0.045, delay,
    });
    return () => { tween.kill(); };
  }, [text, delay]);
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {[...word].map((c, i) => <span key={i} className="ch inline-block origin-bottom">{c}</span>)}
          {w < text.split(' ').length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
