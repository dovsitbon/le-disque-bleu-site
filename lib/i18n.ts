import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
import type { Locale } from "@/lib/locales";

export { defaultLocale, intlLocale, isLocale, locales, ogLocale, type Locale } from "@/lib/locales";
export type Dict = typeof fr;

const dictionaries: Record<Locale, Dict> = { fr, en };

export const getDict = (lang: Locale): Dict => dictionaries[lang];

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

/** Texte alternatif d'une image de public/media, d'après son nom de fichier. */
export function altOf(d: Dict, src: string) {
  const key = src.split("/").pop()!.replace(/\.\w+$/, "") as keyof Dict["alt"];
  return d.alt[key] ?? "";
}
