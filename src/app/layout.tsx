import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  const META = {
    en: ["SoundCY — Where Cyprus Finds Its Sound", "Discover musicians. Find gigs. Create unforgettable experiences. The music booking marketplace for Cyprus."],
    el: ["SoundCY — Εκεί που η Κύπρος βρίσκει τον ήχο της", "Ανακάλυψε μουσικούς. Βρες δουλειές. Δημιούργησε αξέχαστες στιγμές. Η πλατφόρμα κρατήσεων μουσικών της Κύπρου."],
    ru: ["SoundCY — Здесь Кипр находит свой звук", "Находите музыкантов. Находите выступления. Создавайте незабываемые события. Площадка для бронирования музыкантов на Кипре."],
  } as const;
  const [title, description] = META[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s · SoundCY" },
    description,
    applicationName: "SoundCY",
    appleWebApp: { capable: true, title: "SoundCY", statusBarStyle: "black-translucent" },
    icons: { apple: "/icons/apple-touch-icon.png" },
    openGraph: { type: "website", siteName: "SoundCY", title, description, locale: lang === "el" ? "el_GR" : lang === "ru" ? "ru_RU" : "en_GB" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = { themeColor: "#0b0d15", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getI18n();
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Commissioner:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="min-h-dvh">
        <I18nProvider lang={lang}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-flame focus:px-4 focus:py-2 focus:text-ink">
            {t.nav.skip}
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
