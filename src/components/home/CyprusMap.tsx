"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CYPRUS_BOX, CYPRUS_KX, CYPRUS_PATH, CYPRUS_SCALE, CYPRUS_VIEWBOX } from "@/lib/cyprus-map";
import { CITY_COORDS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const TILT = 32; // degrees the island is tipped back
const LAYERS = 9; // extrusion depth (px in viewBox units per layer = 3)

/** Project a lat/lon to viewBox coordinates. */
function toXY([lat, lon]: [number, number]) {
  return [(lon - CYPRUS_BOX.minLon) * CYPRUS_KX * CYPRUS_SCALE, (CYPRUS_BOX.maxLat - lat) * CYPRUS_SCALE] as const;
}

/**
 * A 3D-tilted map of Cyprus. The island is an extruded SVG slab rotated with CSS 3D;
 * city pins are an upright HTML overlay placed by projecting each city through the
 * same perspective, so labels stay crisp and readable.
 */
export function CyprusMap({ counts }: { counts: Record<string, number> }) {
  const { t, L } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);
  const dots = useRef<Record<string, SVGEllipseElement | null>>({});
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});

  // Pins are placed where the browser actually renders each (3D-transformed) city dot.
  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const next: Record<string, { x: number; y: number }> = {};
    for (const [c, dot] of Object.entries(dots.current)) {
      if (!dot) continue;
      const r = dot.getBoundingClientRect();
      next[c] = { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
    }
    setPos(next);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setW(e.contentRect.width);
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    if (!seen) return;
    const t1 = setTimeout(measure, 1450); // after the tilt-in transition
    return () => clearTimeout(t1);
  }, [seen, w, measure]);

  const H = (w * CYPRUS_VIEWBOX.h) / CYPRUS_VIEWBOX.w;
  const P = w * 1.4; // perspective in px
  const cities = Object.keys(CITY_COORDS)
    .filter((c) => c !== "Kyrenia")
    .map((city) => ({ city, n: counts[city] ?? 0, x: pos[city]?.x ?? 0, y: pos[city]?.y ?? 0, s: 1 }));
  const placed = Object.keys(pos).length > 0;
  const max = Math.max(1, ...cities.map((c) => c.n));

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.6fr]">
      <div>
        <p className="eyebrow">{t.home.mapEyebrow}</p>
        <h2 className="display mt-3 text-4xl font-extrabold">{t.home.mapTitle}</h2>
        <p className="mt-4 text-muted">{t.home.mapText}</p>
        <ul className="mt-8 grid grid-cols-2 gap-2">
          {cities
            .slice()
            .sort((a, b) => b.n - a.n)
            .map((c) => (
              <li key={c.city}>
                <Link
                  href={`/musicians?location=${encodeURIComponent(c.city)}`}
                  onMouseEnter={() => setActive(c.city)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(c.city)}
                  onBlur={() => setActive(null)}
                  className={cn(
                    "group flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition",
                    active === c.city ? "border-flame/60 bg-flame/10" : "border-line bg-surface hover:border-flame/40",
                  )}
                >
                  <span className="font-semibold">{L(c.city)}</span>
                  <span className={cn("text-xs", c.n ? "text-flame" : "text-dim")}>{t.common.artists(c.n)}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div ref={box} className="relative w-full select-none [overflow-x:clip]" style={{ height: H || undefined, aspectRatio: w ? undefined : `${CYPRUS_VIEWBOX.w} / ${CYPRUS_VIEWBOX.h}` }}>
        {/* glow under the island */}
        <div className="absolute inset-x-[10%] bottom-[5%] top-[25%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_122_26/0.25),rgb(139_92_246/0.18)_60%,transparent)] blur-2xl" aria-hidden />

        {w > 0 && (
          <div className="absolute inset-0" style={{ perspective: `${P}px` }} aria-hidden>
            <svg
              viewBox={`0 0 ${CYPRUS_VIEWBOX.w} ${CYPRUS_VIEWBOX.h}`}
              className={cn("absolute inset-0 h-full w-full overflow-visible transition-transform duration-[1400ms] ease-out")}
              style={{ transform: seen ? `rotateX(${TILT}deg)` : `rotateX(${TILT + 25}deg) translateY(30px)`, transformOrigin: "50% 50%" }}
            >
              <defs>
                <linearGradient id="cy-top" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff9a4a" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#ff4d8d" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
                </linearGradient>
                <pattern id="cy-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M24 0H0V24" fill="none" stroke="white" strokeOpacity="0.09" strokeWidth="1" />
                </pattern>
                <clipPath id="cy-clip">
                  <path d={CYPRUS_PATH} />
                </clipPath>
              </defs>
              {/* extruded sides */}
              {Array.from({ length: LAYERS }).map((_, i) => (
                <path key={i} d={CYPRUS_PATH} transform={`translate(0 ${(LAYERS - i) * 3})`} fill={i === 0 ? "#05060a" : `hsl(260 35% ${8 + i}%)`} />
              ))}
              {/* top face */}
              <path d={CYPRUS_PATH} fill="#141826" />
              <path d={CYPRUS_PATH} fill="url(#cy-top)" />
              <rect width={CYPRUS_VIEWBOX.w} height={CYPRUS_VIEWBOX.h} fill="url(#cy-grid)" clipPath="url(#cy-clip)" />
              <path d={CYPRUS_PATH} fill="none" stroke="#ffd2b0" strokeOpacity="0.55" strokeWidth="2" />
              {/* city ground dots */}
              {Object.entries(CITY_COORDS)
                .filter(([c]) => c !== "Kyrenia")
                .map(([c, ll]) => {
                  const [x, y] = toXY(ll);
                  return <ellipse key={c} ref={(el) => { dots.current[c] = el; }} cx={x} cy={y} rx={active === c ? 16 : 9} ry={active === c ? 16 : 9} fill="#ff7a1a" fillOpacity={active === c ? 0.5 : 0.25} className="transition-all" />;
                })}
            </svg>
          </div>
        )}

        {/* upright pins */}
        {placed &&
          cities.map((c, i) => {
            const size = c.n ? 30 + (c.n / max) * 22 : 22;
            const lift = Math.max(18, w * 0.03);
            return (
              <Link
                key={c.city}
                href={`/musicians?location=${encodeURIComponent(c.city)}`}
                aria-label={`${L(c.city)} — ${t.common.artists(c.n)}`}
                onMouseEnter={() => setActive(c.city)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(c.city)}
                onBlur={() => setActive(null)}
                className="group absolute z-10 outline-none"
                style={{
                  left: c.x,
                  top: c.y,
                  transition: "opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1)",
                  transitionDelay: `${i * 80}ms`,
                  opacity: placed ? 1 : 0,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <span className="flex flex-col items-center">
                  <span
                    className={cn(
                      "grid place-items-center rounded-full font-extrabold text-ink shadow-[0_10px_30px_-5px_rgb(255_122_26/0.7)] ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110",
                      c.n ? "bg-brand" : "bg-surface-3 text-muted shadow-none",
                      active === c.city && "scale-110 ring-white/60",
                    )}
                    style={{ width: size, height: size, fontSize: size * 0.42 }}
                  >
                    {c.n}
                  </span>
                  <span className="w-px bg-gradient-to-b from-flame to-transparent" style={{ height: lift }} />
                </span>
                <span
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+6px)] whitespace-nowrap rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-fg backdrop-blur transition",
                    active === c.city ? "opacity-100" : c.n ? "opacity-0 sm:opacity-90" : "opacity-0",
                  )}
                >
                  {L(c.city)}
                </span>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
