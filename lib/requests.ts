import site from "@/data/site.json";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { formatDay, formatTime, isoDay, price } from "@/lib/format";
import { isItem, ITEMS, unitPrice, type ItemId } from "@/lib/carte";
import { addDays, pickupTimes, resaTimes, type Service } from "@/lib/hours";

// Les trois demandes du site : table (resa), commande à emporter (order), privatisation (privat).

export const AREAS = ["any", "terrace", "inside"] as const;
export type Area = (typeof AREAS)[number];
export const EVENT_TYPES = ["birthday", "drinks", "company", "family", "evening", "other"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

type Contact = { name: string; phone: string; email: string; message: string };
export type Resa = Contact & { day: string; service: Service; time: string; guests: number; area: Area; occasion: string };
export type OrderLine = { item: ItemId; qty: number };
export type Order = Contact & { lines: OrderLine[]; day: string; time: string };
export type Privat = Contact & { day: string; type: EventType; guests: number; budget: string };

export const isPhone = (v: string) => /^[+\d][\d\s\-().]{7,19}$/.test(v.trim());
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const resaMaxDay = (now: Date) => addDays(isoDay(now), site.resa.daysAhead);

/** Jours de retrait proposés : aujourd'hui et les jours suivants qui ont encore un créneau. */
export function pickupDays(now: Date) {
  const today = isoDay(now);
  return Array.from({ length: site.order.daysAhead + 1 }, (_, i) => addDays(today, i)).filter((day) => pickupTimes(day, now).length > 0);
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const day = (v: unknown) => (ISO.test(str(v, 10)) ? str(v, 10) : "");
// Marge de 10 minutes : le client a pu choisir son heure juste avant qu'elle ne sorte de la liste
const grace = (now: Date) => new Date(now.getTime() - 10 * 60_000);

function contact(o: Record<string, unknown>): Contact | null {
  const c = { name: str(o.name, 120), phone: str(o.phone, 30), email: str(o.email, 160), message: str(o.message, 1000) };
  if (!c.name || !isPhone(c.phone)) return null;
  if (c.email && !isEmail(c.email)) c.email = "";
  return c;
}

export function parseResa(v: unknown, now = new Date()): Resa | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const c = contact(o);
  const d = day(o.day);
  const service: Service = o.service === "dinner" ? "dinner" : "lunch";
  const time = str(o.time, 5);
  const guests = Math.round(Number(o.guests) || 0);
  if (!c || !d || d > resaMaxDay(now) || !resaTimes(d, service, grace(now)).includes(time) || guests < 1 || guests > site.resa.maxGuests) return null;
  return { ...c, day: d, service, time, guests, area: AREAS.includes(o.area as Area) ? (o.area as Area) : "any", occasion: str(o.occasion, 200) };
}

export function parseOrder(v: unknown, now = new Date()): Order | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const c = contact(o);
  const lines = (Array.isArray(o.lines) ? o.lines : []).slice(0, 30).flatMap((l): OrderLine[] => {
    if (!l || typeof l !== "object") return [];
    const x = l as Record<string, unknown>;
    if (!isItem(x.item) || !ITEMS[x.item].orderable) return [];
    return [{ item: x.item, qty: Math.min(Math.max(Math.round(Number(x.qty) || 1), 1), site.order.maxPerLine) }];
  });
  const d = day(o.day);
  const time = str(o.time, 5);
  if (!c || !lines.length || !d || !pickupTimes(d, grace(now)).includes(time)) return null;
  return { ...c, lines, day: d, time };
}

export function parsePrivat(v: unknown, now = new Date()): Privat | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const c = contact(o);
  const d = day(o.day);
  const guests = Math.round(Number(o.guests) || 0);
  if (!c || !d || d < isoDay(now) || !EVENT_TYPES.includes(o.type as EventType) || guests < 1 || guests > 500) return null;
  return { ...c, day: d, type: o.type as EventType, guests, budget: str(o.budget, 60) };
}

/** Total estimé ; « partial » si un des plats n'a pas encore de prix. */
export function orderTotal(lines: OrderLine[]) {
  let sum = 0;
  let partial = false;
  for (const l of lines) {
    const p = unitPrice(l.item);
    if (p === null) partial = true;
    else sum += p * l.qty;
  }
  return { sum, partial };
}

const colon = (lang: Locale) => (lang === "fr" ? " :" : ":");
const longDay = (iso: string, lang: Locale) => formatDay(iso, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const join = (blocks: (string | false)[]) => blocks.filter(Boolean).join("\n\n");

function who(q: Contact, m: { name: string; phone: string; email: string }, c: string) {
  return [`${m.name}${c} ${q.name}`, `${m.phone}${c} ${q.phone}`, q.email ? `${m.email}${c} ${q.email}` : ""].filter(Boolean).join("\n");
}

export function resaText(r: Resa, lang: Locale, d: Dict, withContact = true) {
  const m = d.resa.mail;
  const c = colon(lang);
  return join([
    [`${m.date}${c} ${longDay(r.day, lang)}`, `${m.service}${c} ${d.resa.services[r.service]}`, `${m.time}${c} ${formatTime(r.time, lang)}`, `${m.guests}${c} ${r.guests}`, `${m.area}${c} ${d.resa.areas[r.area]}`, r.occasion ? `${m.occasion}${c} ${r.occasion}` : ""].filter(Boolean).join("\n"),
    withContact && who(r, m, c),
    !!r.message && `${m.message}${c}\n${r.message}`,
  ]);
}

export function orderText(q: Order, lang: Locale, d: Dict, withContact = true) {
  const m = d.order.mail;
  const c = colon(lang);
  const { sum, partial } = orderTotal(q.lines);
  const total = sum > 0 ? `${price(sum, lang)}${partial ? ` + ${d.carte.priceOnSite.toLowerCase()}` : ""}` : d.carte.priceOnSite;
  return join([
    [`${m.lines}${c}`, ...q.lines.map((l) => `– ${l.qty} × ${d.products[l.item].name}`)].join("\n"),
    `${m.pickup}${c} ${longDay(q.day, lang)}, ${formatTime(q.time, lang)}`,
    `${m.total}${c} ${total}`,
    withContact && who(q, m, c),
    !!q.message && `${m.message}${c}\n${q.message}`,
  ]);
}

export function privatText(p: Privat, lang: Locale, d: Dict, withContact = true) {
  const m = d.privat.mail;
  const c = colon(lang);
  return join([
    [`${m.date}${c} ${longDay(p.day, lang)}`, `${m.type}${c} ${d.privat.types[p.type]}`, `${m.guests}${c} ${p.guests}`, p.budget ? `${m.budget}${c} ${p.budget}` : ""].filter(Boolean).join("\n"),
    withContact && who(p, m, c),
    !!p.message && `${m.message}${c}\n${p.message}`,
  ]);
}

/** Lien WhatsApp (vide tant que le restaurant n'a pas donné de portable : data/site.json → whatsapp). */
export const waLink = (text: string) => (site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : "");
