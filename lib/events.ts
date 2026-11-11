import data from "@/data/evenements.json";

export type KindId = keyof typeof data.kinds;
export type Upcoming = { kind: KindId; date: string; time: string; fr: string; en: string };

/** Soirées à venir (data/evenements.json), les plus proches d'abord ; les dates passées disparaissent. */
export function upcoming(today: string): Upcoming[] {
  return (data.upcoming as Upcoming[]).filter((e) => e.date >= today && e.kind in data.kinds).sort((a, b) => a.date.localeCompare(b.date));
}

export const featured = data.featured as KindId[];
export const kindPhoto = (k: KindId) => (data.kinds[k] as { photo?: string }).photo ?? null;
