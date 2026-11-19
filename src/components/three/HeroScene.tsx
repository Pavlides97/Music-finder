"use client";

import dynamic from "next/dynamic";

// three.js is only downloaded in the browser, after the page is interactive.
const SoundSphere = dynamic(() => import("./SoundSphere"), { ssr: false });

export function HeroScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgb(255_122_26/0.28),rgb(139_92_246/0.22)_45%,transparent_70%)] blur-2xl" />
      <SoundSphere className="absolute inset-0" />
    </div>
  );
}
