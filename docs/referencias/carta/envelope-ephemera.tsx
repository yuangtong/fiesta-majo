// REFERENCIA (sin integrar). Ephemera "Envelope" — MIT — https://ephemera.kerrshift.com/components/envelope
"use client";

import * as React from "react";

export interface EnvelopeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  /** The letter inside. Put the important bit at the top: that's what peeks out. */
  children: React.ReactNode;
  /** Something on the flap, e.g. a <WaxSeal />. It hides when the envelope opens. */
  seal?: React.ReactNode;
  /** Handwritten address on the front. */
  to?: React.ReactNode;
  color?: string;
  letterColor?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function Envelope({
  children,
  seal,
  to,
  color = "#e9dcc3",
  letterColor = "#fffdf8",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className = "",
  style,
  ...props
}: EnvelopeProps) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = openProp ?? inner;
  const toggle = () => {
    setInner(!open);
    onOpenChange?.(!open);
  };

  const paper = (shade: string) => `${NOISE}, linear-gradient(${shade}, ${shade}), ${color}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={open ? "Close envelope" : "Open envelope"}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className={`relative w-full max-w-[420px] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${className}`}
      style={{ aspectRatio: "7 / 5", perspective: 1400, ...style }}
      {...props}
    >
      {/* back */}
      <div
        className="absolute inset-0 rounded-[6px]"
        style={{ background: paper("rgb(0 0 0 / .14)"), boxShadow: "0 14px 28px -10px rgb(0 0 0 / .35), 0 2px 4px rgb(0 0 0 / .12)" }}
      />

      {/* letter */}
      <div
        className="absolute inset-x-[5%] top-[4%] h-[92%] overflow-hidden rounded-[3px] p-[6%]"
        style={{
          zIndex: 2,
          background: `${NOISE}, ${letterColor}`,
          color: "#2a2620",
          boxShadow: "0 1px 3px rgb(0 0 0 / .15)",
          transform: open ? "translateY(-62%)" : "translateY(0)",
          transition: open ? "transform .7s cubic-bezier(.3,.9,.4,1) .45s" : "transform .5s cubic-bezier(.6,0,.8,.4)",
        }}
      >
        {children}
      </div>

      {/* front pocket */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[6px]"
        style={{
          zIndex: 3,
          background: paper("rgb(255 255 255 / .06)"),
          clipPath: "polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)",
          filter: "drop-shadow(0 -1px 0 rgb(0 0 0 / .1))",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top right, transparent 49.6%, rgb(0 0 0 / .07) 50%, transparent 50.6%), linear-gradient(to top left, transparent 49.6%, rgb(0 0 0 / .07) 50%, transparent 50.6%)",
          }}
        />
        {to && (
          <div
            className="absolute inset-x-0 bottom-[12%] text-center text-[22px] leading-tight"
            style={{ fontFamily: "var(--font-hand, 'Bradley Hand', cursive)", color: "#2b2a5a" }}
          >
            {to}
          </div>
        )}
      </div>

      {/* flap */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%]"
        style={{
          zIndex: open ? 1 : 4,
          transformOrigin: "top",
          transform: open ? "rotateX(180deg)" : "rotateX(0deg)",
          transition: open
            ? "transform .55s cubic-bezier(.4,0,.2,1), z-index 0s .27s"
            : "transform .55s cubic-bezier(.4,0,.2,1) .4s, z-index 0s .67s",
          filter: "drop-shadow(0 2px 2px rgb(0 0 0 / .14))",
        }}
      >
        <div
          className="absolute inset-0 rounded-t-[6px]"
          style={{ background: paper("rgb(0 0 0 / .03)"), clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        />
      </div>

      {seal && (
        <div
          className="pointer-events-none absolute left-1/2 top-[60%]"
          style={{
            zIndex: 5,
            transform: `translate(-50%, -50%) scale(${open ? 0.6 : 1})`,
            opacity: open ? 0 : 1,
            transition: open ? "all .25s ease-in" : "all .3s ease-out .8s",
          }}
        >
          {seal}
        </div>
      )}
    </div>
  );
}
