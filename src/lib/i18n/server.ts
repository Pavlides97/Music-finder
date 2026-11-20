import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { LANG_COOKIE, normalizeLang, type Lang } from "./core";
import { makeI18n } from "./index";

/** Language from the cookie, else the browser's first Greek/Russian/English preference, else English. */
export const getLang = cache(async (): Promise<Lang> => {
  const fromCookie = normalizeLang((await cookies()).get(LANG_COOKIE)?.value);
  if (fromCookie) return fromCookie;
  const accept = (await headers()).get("accept-language") ?? "";
  const first = accept
    .split(",")
    .map((x) => x.trim().slice(0, 2).toLowerCase())
    .find((x) => x === "el" || x === "ru" || x === "en");
  return (first as Lang | undefined) ?? "en";
});

export const getI18n = cache(async () => makeI18n(await getLang()));
