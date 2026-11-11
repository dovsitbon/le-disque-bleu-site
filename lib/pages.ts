import type { Locale } from "@/lib/locales";

// Pages secondaires et leurs adresses dans chaque langue.
export const PAGE_IDS = ["carte", "reserver", "commander", "privatiser", "restaurant", "bar", "legal"] as const;
export type PageId = (typeof PAGE_IDS)[number];

export const SLUGS: Record<PageId, Record<Locale, string>> = {
  carte: { fr: "carte", en: "menu" },
  reserver: { fr: "reserver", en: "book" },
  commander: { fr: "commander", en: "order" },
  privatiser: { fr: "soirees-privatisation", en: "events-private-hire" },
  restaurant: { fr: "restaurant-montmorency", en: "restaurant-in-montmorency" },
  bar: { fr: "bar-terrasse-montmorency", en: "bar-terrace-in-montmorency" },
  legal: { fr: "mentions-legales", en: "legal" },
};

export const pagePath = (id: PageId, lang: Locale) => `/${lang}/${SLUGS[id][lang]}`;

export const pageOfSlug = (slug: string, lang: Locale) => PAGE_IDS.find((id) => SLUGS[id][lang] === slug) ?? null;
