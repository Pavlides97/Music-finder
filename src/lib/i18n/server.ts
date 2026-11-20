import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { LANG_COOKIE, normalizeLang, type Lang } from "./core";
import { makeI18n } from "./index";

/** Language from the cookie, else the browser's preference (Greek → el), else English. */
export const getLang = cache(async (): Promise<Lang> => {
  const fromCookie = normalizeLang((await cookies()).get(LANG_COOKIE)?.value);
  if (fromCookie) return fromCookie;
  const accept = (await headers()).get("accept-language") ?? "";
  return /^el\b|,\s*el\b/i.test(accept) ? "el" : "en";
});

export const getI18n = cache(async () => makeI18n(await getLang()));
