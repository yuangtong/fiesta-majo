import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { prefersReducedMotion } from './motion';
import { squeak } from './sfx';

gsap.registerPlugin(Draggable, InertiaPlugin);

interface ThrowOptions {
  bounds?: Draggable.Vars['bounds'];
  /** Al agarrarlo (para pausar paseos, traerlo adelante…) */
  onGrab?: (el: HTMLElement) => void;
  /** Cuando quedó quieto después de soltarlo (para retomar el paseo, mandarlo atrás…) */
  onRest?: (el: HTMLElement) => void;
  /** Un toque sin arrastrar */
  onTap?: (el: HTMLElement) => void;
}

const TILT_MAX = 16;

// Arrastrar con física: al soltar sigue en la dirección del gesto con inercia y frena con fricción,
// se inclina según la velocidad mientras se mueve y al detenerse se endereza con un rebote.
export function makeThrowable(targets: gsap.DOMTarget, opts: ThrowOptions = {}) {
  const reduced = prefersReducedMotion();
  const tilt = (el: HTMLElement) => {
    if (reduced) return;
    const vx = InertiaPlugin.getVelocity(el, 'x') || 0;
    gsap.to(el, { rotation: gsap.utils.clamp(-TILT_MAX, TILT_MAX, vx / 70), duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
  };
  const settle = (el: HTMLElement) => {
    if (!reduced) gsap.to(el, { rotation: 0, scale: 1, duration: 0.9, ease: 'elastic.out(1.1, 0.35)' });
    opts.onRest?.(el);
  };
  let grabbed: HTMLElement | null = null;
  const grab = (el: HTMLElement) => {
    if (grabbed === el) return;
    grabbed = el;
    squeak();
    opts.onGrab?.(el);
    if (!reduced) gsap.to(el, { scale: 1.12, duration: 0.25, ease: 'back.out(3)', overwrite: 'auto' });
  };

  return Draggable.create(targets, {
    bounds: opts.bounds,
    inertia: !reduced,
    edgeResistance: 0.75,
    throwResistance: 1400,
    maxDuration: 1.8,
    minDuration: 0.3,
    zIndexBoost: false,
    onPress() { grab(this.target); },
    onDragStart() { grab(this.target); },
    onDrag() { tilt(this.target); },
    onThrowUpdate() { tilt(this.target); },
    onClick() { grabbed = null; opts.onTap?.(this.target); settle(this.target); },
    onRelease() {
      const el = this.target as HTMLElement;
      grabbed = null;
      if (!this.isThrowing) settle(el);
    },
    onThrowComplete() { settle(this.target); },
  });
}

// La pantalla queda encima del cielo y de los juguetes de fondo (para hacer scroll y leer).
// Si el toque cae en un espacio vacío y hay algo arrastrable debajo, se empieza a arrastrar eso.
export function installPassthrough() {
  // Solo botones, enlaces, campos y cosas que ya se arrastran por sí mismas bloquean el toque;
  // en cualquier otro punto (texto, títulos, contenedores), si hay un juguete o nube debajo, se agarra.
  const INTERACTIVE = 'button, a, input, textarea, select, label, iframe, [role="button"], .sticker, .rcard, .toy, .cloud, .htoy, .hdrag, .drag-self';
  const isEmptySpot = (t: EventTarget | null) => t instanceof Element && !t.closest(INTERACTIVE);
  const onDown = (ev: MouseEvent | TouchEvent) => {
    if (!isEmptySpot(ev.target)) return;
    const p = 'touches' in ev ? ev.touches[0] : ev;
    const el = document.elementsFromPoint(p.clientX, p.clientY)
      .find((n) => n.classList.contains('toy') || n.classList.contains('cloud'));
    const drag = el && Draggable.get(el);
    if (!drag) return;
    ev.preventDefault();
    drag.startDrag(ev);
  };
  window.addEventListener('mousedown', onDown, true);
  window.addEventListener('touchstart', onDown, { capture: true, passive: false });
  return () => {
    window.removeEventListener('mousedown', onDown, true);
    window.removeEventListener('touchstart', onDown, true);
  };
}
