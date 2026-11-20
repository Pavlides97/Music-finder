import { DICT } from "./dict";
import { formatDate, formatEuro, pick, valueLabel, type Lang } from "./core";
import { ru } from "./ru";

export type { Lang } from "./core";

const en = pick(DICT, 0);
export type Dict = typeof en;
const DICTS: Record<Lang, Dict> = { en, el: pick(DICT, 1), ru };

export function makeI18n(lang: Lang) {
  const t = DICTS[lang];
  const eur = (n: number | null | undefined) => formatEuro(lang, n);
  return {
    lang,
    t,
    /** Pick the translated version of user content for the current language (falls back to the original). */
    tr: (en: string, el?: string | null, ru?: string | null) => (lang === "el" && el ? el : lang === "ru" && ru ? ru : en),
    /** Translate a stored value (genre, city, type…) for display. */
    L: (v: string) => valueLabel(lang, v),
    d: (iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions) => formatDate(lang, iso, opts),
    dLong: (iso: string | null | undefined) => formatDate(lang, iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    eur,
    budget: (min?: number | null, max?: number | null) =>
      min && max ? `${eur(min)} – ${eur(max)}` : max ? t.common.upTo(eur(max)) : min ? t.common.from(eur(min)) : t.common.negotiable,
    price: (from?: number | null, to?: number | null): string | null =>
      from && to && to > from ? `${eur(from)} – ${eur(to)}` : from ? t.common.from(eur(from)) : to ? t.common.upTo(eur(to)) : null,
    /** Render a chat message body; automatic messages are stored as {k, p} JSON. */
    msg: (body: string | null | undefined) => {
      if (!body) return "";
      if (body.startsWith('{"k":')) {
        try {
          const { k, p } = JSON.parse(body) as { k: string; p?: Record<string, unknown> };
          const fn = (t.sys as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[k];
          if (fn) return fn(p ?? {});
        } catch {}
      }
      return body;
    },
    ago: (iso: string) => {
      const diff = (Date.now() - new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")).getTime()) / 1000;
      if (diff < 60) return t.common.justNow;
      if (diff < 3600) return t.common.minutesAgo(Math.floor(diff / 60));
      if (diff < 86400) return t.common.hoursAgo(Math.floor(diff / 3600));
      if (diff < 86400 * 7) return t.common.daysAgo(Math.floor(diff / 86400));
      return formatDate(lang, iso.slice(0, 10), { day: "numeric", month: "short" });
    },
  };
}
export type I18n = ReturnType<typeof makeI18n>;
