"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Track } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Equalizer } from "../ui/Equalizer";

export function AudioPlayer({ tracks, artist }: { tracks: Track[]; artist: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState("0:00");

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onTime = () => {
      setProgress(a.duration ? a.currentTime / a.duration : 0);
      const s = Math.floor(a.currentTime);
      setTime(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
    };
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = (i: number) => {
    const a = audio.current!;
    if (current === i) {
      if (playing) a.pause();
      else a.play().catch(() => setPlaying(false));
      setPlaying(!playing);
      return;
    }
    a.src = tracks[i].url;
    setCurrent(i);
    setProgress(0);
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>, i: number) => {
    if (current !== i || !audio.current?.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.current.currentTime = ((e.clientX - r.left) / r.width) * audio.current.duration;
  };

  return (
    <div className="space-y-2">
      <audio ref={audio} preload="none" />
      {tracks.map((t, i) => {
        const active = current === i;
        return (
          <div key={i} className={cn("flex items-center gap-4 rounded-2xl border p-3 transition", active ? "border-flame/40 bg-flame/[0.06]" : "border-line bg-surface hover:bg-surface-2")}>
            <button
              onClick={() => toggle(i)}
              className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full transition", active && playing ? "bg-flame text-ink" : "bg-white/10 text-fg hover:bg-flame hover:text-ink")}
              aria-label={active && playing ? `Pause ${t.title}` : `Play ${t.title}`}
            >
              {active && playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <span className="shrink-0 text-xs tabular-nums text-muted">{active ? time + " / " : ""}{t.duration}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/10" onClick={(e) => seek(e, i)}>
                  <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${(active ? progress : 0) * 100}%` }} />
                </div>
                {active && playing ? <Equalizer className="h-3 text-flame" /> : <span className="text-[10px] text-dim">{artist}</span>}
              </div>
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-dim">Demo previews use royalty-free sample audio.</p>
    </div>
  );
}
