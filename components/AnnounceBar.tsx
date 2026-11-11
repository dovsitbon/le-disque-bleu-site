"use client";

import { useEffect, useState } from "react";
import annonces from "@/data/annonces.json";
import pdj from "@/data/plat-du-jour.json";
import { CloseIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { isoDay } from "@/lib/format";
import { fill } from "@/lib/i18n";

type Item = { id: string; from?: string; to?: string; fr: string; en: string; dish?: boolean };

/**
 * Message du moment, refermable et mémorisé pour la session :
 * 1. une annonce datée de data/annonces.json (soirée, fermeture, horaires d'été) ;
 * 2. sinon le plat du jour, s'il est renseigné dans data/plat-du-jour.json ;
 * 3. sinon le message par défaut.
 */
function current(today: string): Item {
  const dated = (annonces.items as Item[]).find((a) => (!a.from || a.from <= today) && (!a.to || today <= a.to));
  if (dated) return dated;
  const day = (pdj.days as { date: string; dish: { fr: string; en: string } }[]).find((x) => x.date === today);
  if (day) return { id: `pdj-${today}`, ...day.dish, dish: true };
  return annonces.default as Item;
}

export function AnnounceBar() {
  const { lang, d } = useLocale();
  const [item, setItem] = useState<Item>(() => current(isoDay(new Date())));
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const it = current(isoDay(new Date()));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- date du navigateur, connue seulement après hydratation
    setItem(it);
    try {
      if (sessionStorage.getItem(`disquebleu-bandeau-${it.id}`) === "1") setClosed(true);
    } catch {}
  }, []);

  if (closed) return null;
  return (
    <div className="relative z-[51] flex min-h-10 items-center justify-center bg-blue px-12 py-2 text-center text-[0.9375rem] leading-snug text-cream">
      <p suppressHydrationWarning>{item.dish ? fill(d.announce.pdj, { dish: item[lang] }) : item[lang]}</p>
      <button
        type="button"
        onClick={() => {
          setClosed(true);
          try {
            sessionStorage.setItem(`disquebleu-bandeau-${item.id}`, "1");
          } catch {}
        }}
        className="absolute end-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center opacity-75 transition-opacity hover:opacity-100"
        aria-label={d.announce.close}
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
