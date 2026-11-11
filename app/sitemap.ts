import type { MetadataRoute } from "next";
import site from "@/data/site.json";
import { defaultLocale, locales, type Locale } from "@/lib/locales";
import { pagePath, type PageId } from "@/lib/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const alt = (path: (l: Locale) => string) => ({ languages: { ...Object.fromEntries(locales.map((l) => [l, `${site.url}${path(l)}`])), "x-default": `${site.url}${path(defaultLocale)}` } });
  const home = locales.map((lang) => ({ url: `${site.url}/${lang}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: lang === defaultLocale ? 1 : 0.8, alternates: alt((l) => `/${l}`) }));
  const pages = (["carte", "reserver", "commander", "privatiser", "restaurant", "bar"] as PageId[]).flatMap((id) =>
    locales.map((lang) => ({ url: `${site.url}${pagePath(id, lang)}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: lang === defaultLocale ? 0.9 : 0.7, alternates: alt((l) => pagePath(id, l)) })),
  );
  return [...home, ...pages];
}
