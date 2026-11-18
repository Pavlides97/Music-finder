import { cn } from "@/lib/utils";

export function Equalizer({ className, bars = 4 }: { className?: string; bars?: number }) {
  return (
    <span className={cn("inline-flex h-4 items-end gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className="eq-bar w-[3px] rounded-full bg-current" style={{ height: "100%", animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
}
