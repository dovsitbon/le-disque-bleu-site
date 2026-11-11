import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import site from "@/data/site.json";
import { getDict, isLocale, locales, ogLocale } from "@/lib/i18n";
import { Providers } from "@/components/providers";
import { AnnounceBar } from "@/components/AnnounceBar";
import { Header, MobileBar } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";

// Polices servies en local (public/fonts, déclarées dans globals.css) : aucun appel à Google Fonts.

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  return {
    metadataBase: new URL(site.url),
    title: d.meta.title,
    description: d.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { ...Object.fromEntries(locales.map((l) => [l, `/${l}`])), "x-default": "/fr" },
    },
    openGraph: {
      type: "website",
      url: `/${lang}`,
      siteName: site.fullName,
      title: d.meta.title,
      description: d.meta.description,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: d.meta.ogAlt }],
    },
    twitter: { card: "summary_large_image", title: d.meta.title, description: d.meta.description, images: ["/og.jpg"] },
    formatDetection: { telephone: false },
    robots: { index: true, follow: true, "max-image-preview": "large" },
    // Pas de traduction automatique du navigateur : le site a son propre sélecteur FR · EN
    other: { google: "notranslate" },
  };
}

export const viewport: Viewport = { themeColor: "#f6f0e4", width: "device-width", initialScale: 1 };

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

const introScript = `document.documentElement.classList.add("js");try{if(sessionStorage.getItem("disquebleu-intro")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-seen")}catch(e){}`;

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <html lang={lang} translate="no" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <link rel="preload" href="/fonts/playfair-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/jost-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="notranslate">
        <Providers lang={lang} d={d}>
          <Intro skipLabel={d.intro.skip} />
          <AnnounceBar />
          <Header />
          <main id="main">{children}</main>
          <Footer lang={lang} d={d} />
          <MobileBar />
        </Providers>
      </body>
    </html>
  );
}
