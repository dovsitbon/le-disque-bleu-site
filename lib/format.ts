import { intlLocale, type Locale } from "@/lib/locales";

/** Prix en euros : « 2,50 € » / « €2.50 ». */
export const price = (n: number, lang: Locale) => new Intl.NumberFormat(intlLocale[lang], { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);

/** Date AAAA-MM-JJ du jour, heure de Paris. */
export function isoDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function formatDay(iso: string, lang: Locale, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale[lang], { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d || 1)));
}

/** « 19:00 » → « 19 h » (fr) / « 7 pm » (en). */
export function formatTime(hhmm: string, lang: Locale) {
  const [h, m] = hhmm.split(":").map(Number);
  if (lang === "fr") return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}
