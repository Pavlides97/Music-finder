"use client";

import { useEffect, useRef, useState } from "react";
import { cn, hashHue, initials, unsplash } from "@/lib/utils";

/**
 * Image with a graceful, on-brand fallback (gradient + initials / waveform)
 * when the source is missing or fails to load.
 */
export function Photo({
  src,
  alt,
  w = 800,
  className,
  imgClassName,
  label,
  rounded,
}: {
  src?: string | null;
  alt: string;
  w?: number;
  className?: string;
  imgClassName?: string;
  label?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Errors that fire before hydration never reach onError, so check after mount too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);
  const url = unsplash(src, w);
  const hue = hashHue(alt);
  const show = url && !failed;
  return (
    <div className={cn(!/\b(absolute|fixed)\b/.test(className ?? "") && "relative", "overflow-hidden bg-surface-2", rounded, className)}>
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={url}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `radial-gradient(120% 90% at 20% 10%, hsl(${hue} 85% 58% / .85), transparent 60%), radial-gradient(100% 90% at 90% 100%, hsl(${(hue + 60) % 360} 80% 50% / .8), transparent 60%), #141826`,
          }}
          role="img"
          aria-label={alt}
        >
          {label !== "" && (
            <span className="display select-none text-[clamp(1rem,30%,3.5rem)] font-bold text-white/85 drop-shadow">
              {label ?? initials(alt)}
            </span>
          )}
          <svg className="absolute bottom-0 left-0 right-0 h-1/3 w-full opacity-30" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden>
            {Array.from({ length: 40 }).map((_, i) => {
              const h = Math.round(6 + Math.abs(Math.sin(i * 1.7 + hue)) * 30);
              return <rect key={i} x={i * 5} y={40 - h} width="3" height={h} rx="1.5" fill="white" />;
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
