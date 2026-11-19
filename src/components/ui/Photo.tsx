"use client";

import { useEffect, useRef, useState } from "react";
import { cn, hashHue, initials, unsplash } from "@/lib/utils";

/**
 * Image with an on-brand 3D fallback (glossy orb + initials over a soft colour
 * field) when the source is missing or fails to load.
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
  const positioned = /\b(absolute|fixed)\b/.test(className ?? "");
  const text = label ?? initials(alt);

  return (
    <div className={cn(!positioned && "relative", "overflow-hidden bg-surface-2", rounded, className)}>
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn("h-full w-full object-cover", imgClassName)} />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className={cn("absolute inset-0 [container-type:size]", imgClassName)}
          style={{
            background: `radial-gradient(90% 70% at 15% 0%, hsl(${hue} 70% 45% / .45), transparent 60%),
              radial-gradient(80% 70% at 100% 100%, hsl(${(hue + 50) % 360} 75% 45% / .4), transparent 60%),
              linear-gradient(160deg, #161a28, #0c0e16)`,
          }}
        >
          {text !== "" ? (
            <div className="absolute inset-0 grid place-items-center">
              <div
                className="orb grid aspect-square w-[min(52cqw,52cqh)] place-items-center"
                style={
                  {
                    "--orb-a": `hsl(${hue} 85% 62%)`,
                    "--orb-b": `hsl(${(hue + 40) % 360} 70% 32%)`,
                    "--orb-glow": `hsl(${hue} 90% 55% / .45)`,
                  } as React.CSSProperties
                }
              >
                <span className="display select-none text-[min(17cqw,17cqh)] font-extrabold leading-none text-white drop-shadow-[0_2px_8px_rgb(0_0_0/0.35)]">
                  {text}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="orb absolute -right-[10%] -top-[30%] aspect-square w-[55%] opacity-50 blur-[2px]"
              style={
                {
                  "--orb-a": `hsl(${hue} 80% 55%)`,
                  "--orb-b": `hsl(${(hue + 40) % 360} 70% 28%)`,
                  "--orb-glow": "transparent",
                } as React.CSSProperties
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
