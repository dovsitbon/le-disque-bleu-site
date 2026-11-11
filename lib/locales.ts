// Langues du site, sans les textes : importable côté client sans embarquer les dictionnaires.
export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

export const ogLocale: Record<Locale, string> = { fr: "fr_FR", en: "en_GB" };
export const intlLocale: Record<Locale, string> = { fr: "fr-FR", en: "en-GB" };
