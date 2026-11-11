// Logo du Disque Bleu, redessiné d'après sa photo de profil Instagram : un verre de vin rouge au trait,
// « LE DISQUE BLEU » en capitales à empattements, « MONTMORENCY » en petit.
// Les fichiers public/logo.svg et logo-clair.svg (npm run logo) reprennent le même dessin, texte vectorisé.

/** Le verre seul. `wine` : couleur du vin ; le trait suit la couleur du texte. */
export function Glass({ className = "", wine = "var(--color-red)" }: { className?: string; wine?: string }) {
  return (
    <svg viewBox="0 0 48 84" className={className} fill="none" aria-hidden="true">
      <path d="M11.2 33.5c3.9-2.6 8.6 2.2 14.3-.1 4.2-1.7 7.8-1.6 11.4-.2l.3 2.3a13.2 13.2 0 0 1-26.4 0z" fill={wine} />
      <path d="M14.5 3c-1.6 14-4 23.500-4 32.500a13.500 13.500 0 0 0 27 0c0-9-2.400-18.500-4-32.500" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M24 49v27" stroke="currentColor" strokeWidth="2.4" />
      <path d="M12.500 78.500c2-2 6.500-2.800 11.500-2.800s9.500.8 11.500 2.800c-2 1.300-6.500 2-11.500 2s-9.500-.7-11.500-2z" fill="currentColor" />
    </svg>
  );
}

/** Le disque bleu : un vinyle au trait, le verre au centre. Sert de favicon, de puce et pour l'ouverture. */
export function Disc({ className = "", glass = true }: { className?: string; glass?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      {glass ? (
        <g transform="translate(38.500 29) scale(0.48)">
          <path d="M11.2 33.5c3.9-2.6 8.6 2.2 14.3-.1 4.2-1.7 7.8-1.6 11.4-.2l.3 2.3a13.2 13.2 0 0 1-26.4 0z" fill="var(--color-red)" />
          <path d="M14.5 3c-1.6 14-4 23.500-4 32.500a13.500 13.500 0 0 0 27 0c0-9-2.400-18.500-4-32.500" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M24 49v27" stroke="currentColor" strokeWidth="3.2" />
          <path d="M12.500 78.500c2-2 6.500-2.800 11.500-2.800s9.500.8 11.500 2.800c-2 1.300-6.500 2-11.500 2s-9.500-.7-11.500-2z" fill="currentColor" />
        </g>
      ) : (
        <circle cx="50" cy="50" r="4" fill="currentColor" />
      )}
    </svg>
  );
}

/** Logo complet. `stacked` : verre au-dessus (pied de page, ouverture) ; sinon verre à gauche (en-tête). */
export function Logo({ stacked = false, light = false, className = "" }: { stacked?: boolean; light?: boolean; className?: string }) {
  const sub = light ? "text-cream/75" : "text-red";
  if (stacked)
    return (
      <span className={`inline-flex flex-col items-center ${className}`}>
        <Glass className="h-16 w-auto" wine={light ? "#C9503E" : undefined} />
        <span className="mt-3 font-[family-name:var(--font-display)] text-[1.375rem] leading-none tracking-[0.2em] whitespace-nowrap">LE DISQUE BLEU</span>
        <span className={`mt-2.5 text-[0.625rem] leading-none font-medium tracking-[0.42em] ${sub}`}>MONTMORENCY</span>
      </span>
    );
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Glass className="h-10 w-auto shrink-0 md:h-11" />
      <span className="flex flex-col">
        <span className="font-[family-name:var(--font-display)] text-[1.0625rem] leading-none tracking-[0.18em] whitespace-nowrap md:text-[1.1875rem]">LE DISQUE BLEU</span>
        <span className={`mt-1.5 text-[0.5625rem] leading-none font-medium tracking-[0.4em] ${sub}`}>MONTMORENCY</span>
      </span>
    </span>
  );
}
