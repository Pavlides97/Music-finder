"use client";

import { createContext, useContext, useMemo } from "react";
import { makeI18n, type Lang } from "./index";

const Ctx = createContext<Lang>("en");

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const lang = useContext(Ctx);
  return useMemo(() => makeI18n(lang), [lang]);
}
