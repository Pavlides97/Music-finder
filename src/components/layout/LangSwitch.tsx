"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { LANG_COOKIE, type Lang } from "@/lib/i18n/core";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function LangSwitch({ className }: { className?: string }) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (l: Lang) => {
    if (l === lang) return;
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
    start(() => router.refresh());
  };
  return (
    <div role="group" aria-label={t.common.language} className={cn("glass inline-flex items-center rounded-full p-0.5 text-xs font-bold", pending && "opacity-60", className)}>
      <Languages className="ml-2 mr-1 h-3.5 w-3.5 text-muted" aria-hidden />
      {(["el", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          aria-pressed={lang === l}
          className={cn("rounded-full px-2.5 py-1 transition", lang === l ? "bg-fg text-ink" : "text-muted hover:text-fg")}
        >
          {l === "el" ? "ΕΛ" : "EN"}
        </button>
      ))}
    </div>
  );
}
