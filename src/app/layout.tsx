import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  const el = lang === "el";
  return {
    title: {
      default: el ? "SoundCY — Εκεί που η Κύπρος βρίσκει τον ήχο της" : "SoundCY — Where Cyprus Finds Its Sound",
      template: "%s · SoundCY",
    },
    description: el
      ? "Ανακάλυψε μουσικούς. Βρες δουλειές. Δημιούργησε αξέχαστες στιγμές. Η πλατφόρμα κρατήσεων μουσικών της Κύπρου."
      : "Discover musicians. Find gigs. Create unforgettable experiences. The music booking marketplace for Cyprus.",
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
