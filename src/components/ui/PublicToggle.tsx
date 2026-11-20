"use client";

import { useId } from "react";
import { Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** "Show on What's on" switch. Inside a form it submits public=1 when on. */
export function PublicToggle({
  checked,
  onChange,
  disabled,
  compact,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const hint = useId();
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white/[0.03]", compact ? "mt-3 p-2.5" : "p-3")}>
      <input
        type="checkbox"
        role="switch"
        name="public"
        value="1"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={compact ? undefined : hint}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-flame",
          checked ? "border-flame bg-flame" : "border-line bg-white/10",
        )}
      >
        <span className={cn("absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-[left]", checked ? "left-[18px]" : "left-0.5")} />
      </span>
      <span className="min-w-0">
        <span className={cn("flex items-center gap-1.5 font-medium", compact ? "text-xs" : "text-sm")}>
          <Radio className="h-3.5 w-3.5 text-flame" /> {t.wo.listToggle}
        </span>
        {!compact && <span id={hint} className="mt-0.5 block text-[11px] leading-snug text-dim">{t.wo.listHint}</span>}
      </span>
    </label>
  );
}
