"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a card in a subtle 3D tilt that follows the pointer, with a soft glare.
 * Disabled for touch input and reduced-motion users (falls back to a lift).
 */
export function Tilt({ children, className, max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    el.dataset.active = "1";
  };
  const onLeave = () => {
    const el = ref.current!;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.active;
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("tilt group/tilt relative", className)}>
      {children}
      <span className="tilt-glare pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
    </div>
  );
}
