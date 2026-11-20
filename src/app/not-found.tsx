import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="display text-8xl font-extrabold text-gradient">404</p>
      <h1 className="display mt-4 text-3xl font-bold">{t.common.notFoundTitle}</h1>
      <p className="mt-2 text-muted">{t.common.notFoundText}</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">{t.common.backHome}</Link>
        <Link href="/musicians" className="btn-ghost">{t.common.findMusicians}</Link>
      </div>
    </div>
  );
}
