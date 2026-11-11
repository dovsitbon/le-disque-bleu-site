import Link from "next/link";
import { featured, kindPhoto, upcoming, type KindId } from "@/lib/events";
import { formatDay, formatTime, isoDay } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";
import { Pic } from "@/components/Pic";
import { Reveal } from "@/components/Reveal";

type Card = { key: string; kind: KindId; date?: string; time?: string; note?: string };

/**
 * Trois cartes « à la une » : les prochaines soirées de data/evenements.json ; s'il n'y en a pas (ou moins de trois),
 * les types de soirées de la maison complètent, avec « Prochaine date bientôt annoncée ». Aucune date inventée.
 */
export function Events({ lang, d }: { lang: Locale; d: Dict }) {
  const next = upcoming(isoDay(new Date())).slice(0, 3);
  const cards: Card[] = next.map((e) => ({ key: `${e.kind}-${e.date}`, kind: e.kind, date: e.date, time: e.time, note: e[lang] }));
  for (const k of featured) if (cards.length < 3 && !cards.some((c) => c.kind === k)) cards.push({ key: k, kind: k });

  return (
    <ul className="grid gap-x-6 gap-y-12 md:grid-cols-3">
      {cards.map((c, i) => {
        const t = d.events.kinds[c.kind];
        const photo = kindPhoto(c.kind) ?? "";
        return (
          <Reveal as="li" key={c.key} delay={i * 0.06} className="group flex flex-col">
            <Pic src={photo} d={d} sizes="(min-width: 768px) 31vw, 100vw" className="aspect-[4/3] md:aspect-[4/5]" position="50% 85%" />
            <p className="mt-5 text-[0.9375rem] font-medium text-red">{c.date ? `${formatDay(c.date, lang)}${c.time ? `, ${formatTime(c.time, lang)}` : ""}` : d.events.soon}</p>
            <h3 className="display mt-1.5 text-[1.625rem]">{t.title}</h3>
            <p className="mt-2 text-muted">{c.note ?? t.text}</p>
            {c.date && (
              <div className="mt-auto pt-4">
                <Link href={pagePath("reserver", lang)} className="link-line inline-flex min-h-11 items-center font-medium">
                  {d.events.cta}
                </Link>
              </div>
            )}
          </Reveal>
        );
      })}
    </ul>
  );
}
