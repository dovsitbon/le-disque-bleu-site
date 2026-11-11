"use client";

import { useEffect, useState } from "react";

/**
 * Effet d'ouverture (1,2 s, une fois par session) : le disque bleu se dessine au trait et tourne d'un demi-tour,
 * « LE DISQUE BLEU » puis « MONTMORENCY » apparaissent, fondu sur le hero. Styles dans globals.css (.intro-*).
 * Masqué d'office si déjà vu ou si l'utilisateur préfère réduire les animations (script du layout).
 */
export function Intro({ skipLabel }: { skipLabel: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem("disquebleu-intro", "1");
    } catch {}
    const t = setTimeout(() => setGone(true), 1250);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;
  return (
    <div className="intro-curtain">
      <svg viewBox="0 0 100 100" className="intro-disc h-28 w-28 text-blue md:h-36 md:w-36" fill="none" aria-hidden="true">
        <circle className="intro-ring" cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" pathLength={1} strokeLinecap="round" />
        <circle className="intro-ring intro-ring-2" cx="50" cy="50" r="33" stroke="currentColor" strokeWidth="0.9" pathLength={1} />
        <circle className="intro-ring intro-ring-2" cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="0.9" pathLength={1} />
        <circle cx="50" cy="50" r="3.2" fill="currentColor" />
        <path d="M50 4v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="intro-word mt-7 font-[family-name:var(--font-display)] text-[1.5rem] tracking-[0.22em] md:text-[1.875rem]" aria-hidden="true">
        LE DISQUE BLEU
      </p>
      <p className="intro-word intro-word-2 mt-3 text-[0.6875rem] font-medium tracking-[0.44em] text-red" aria-hidden="true">
        MONTMORENCY
      </p>
      <button type="button" onClick={() => setGone(true)} className="absolute end-5 bottom-5 min-h-11 px-3 text-sm text-muted underline underline-offset-4">
        {skipLabel}
      </button>
    </div>
  );
}
