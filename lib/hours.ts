import hours from "@/data/horaires.json";
import site from "@/data/site.json";
import { isoDay } from "@/lib/format";

export type Slot = [string, string];
type Week = Record<string, Slot[]>;
type Exception = { date: string; closed?: boolean; slots?: Slot[] };

const week = hours.week as unknown as Week;
const summer = hours.summer as unknown as { enabled: boolean; from: string; to: string; week: Week };

/** Horaires d'été en vigueur ce jour-là (data/horaires.json → summer). */
export const isSummer = (iso: string) => summer.enabled && iso >= summer.from && iso <= summer.to;
const exceptions = hours.exceptions as Exception[];

/** Jour ISO (1 = lundi … 7 = dimanche) d'une date AAAA-MM-JJ. */
export const weekday = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1;
};

export const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

/** Créneaux d'ouverture d'un jour donné (fermetures exceptionnelles comprises). */
export function slotsOn(iso: string): Slot[] {
  const ex = exceptions.find((e) => e.date === iso);
  if (ex) return ex.closed ? [] : (ex.slots ?? []);
  return (isSummer(iso) ? summer.week : week)[String(weekday(iso))] ?? [];
}

/** Heure de Paris « HH:MM ». */
export const parisTime = (date: Date) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);

export type Status = { open: true; until: string } | { open: false; nextDay: string | null; at: string | null };

/** Ouvert / fermé en ce moment, et prochaine ouverture. */
export function statusAt(date: Date): Status {
  const today = isoDay(date);
  const now = parisTime(date);
  for (const [a, b] of slotsOn(today)) if (now >= a && now < b) return { open: true, until: b };
  const later = slotsOn(today).find(([a]) => a > now);
  if (later) return { open: false, nextDay: today, at: later[0] };
  for (let i = 1; i <= 14; i++) {
    const day = addDays(today, i);
    const s = slotsOn(day);
    if (s.length) return { open: false, nextDay: day, at: s[0][0] };
  }
  return { open: false, nextDay: null, at: null };
}

/** Horaires de la semaine, du lundi au dimanche, pour l'affichage et le schema.org. */
export const weekHours = () => [1, 2, 3, 4, 5, 6, 7].map((n) => week[String(n)] ?? []);

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/**
 * Heures pendant l'ouverture, dans la fenêtre [from, to] (to peut dépendre de la fermeture : `toOf`),
 * tous les `step` minutes, pas avant `earliest` (minutes depuis minuit).
 */
function timesIn(day: string, from: number, toOf: (close: number) => number, step: number, earliest: number) {
  return slotsOn(day).flatMap(([a, b]) => {
    const start = Math.max(toMin(a), from);
    const end = toOf(toMin(b));
    const out: string[] = [];
    for (let t = Math.ceil(start / step) * step; t <= end; t += step) if (t >= earliest) out.push(toHHMM(t));
    return out;
  });
}

/** Heures de retrait à emporter : pendant l'ouverture, à partir de 11 h 30, pas avant « maintenant + 30 min » le jour même. */
export function pickupTimes(day: string, now: Date): string[] {
  const today = isoDay(now);
  if (day < today) return [];
  const { from, lastBeforeClose, stepMinutes, minutesAhead } = site.order;
  const earliest = day === today ? toMin(parisTime(now)) + minutesAhead : 0;
  return timesIn(day, toMin(from), (close) => close - lastBeforeClose, stepMinutes, earliest);
}

export type Service = "lunch" | "dinner";

/** Heures d'arrivée pour une table : déjeuner (12 h – 14 h 30) ou dîner (à partir de 19 h, jusqu'à 1 h avant la fermeture). */
export function resaTimes(day: string, service: Service, now: Date): string[] {
  const today = isoDay(now);
  if (day < today) return [];
  const { lunch, dinnerFrom, dinnerLastBeforeClose, stepMinutes } = site.resa;
  const earliest = day === today ? toMin(parisTime(now)) + 30 : 0;
  if (service === "lunch") return timesIn(day, toMin(lunch[0]), (close) => Math.min(close - 30, toMin(lunch[1])), stepMinutes, earliest);
  return timesIn(day, toMin(dinnerFrom), (close) => close - dinnerLastBeforeClose, stepMinutes, earliest);
}
