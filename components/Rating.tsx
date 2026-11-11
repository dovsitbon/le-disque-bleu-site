import site from "@/data/site.json";
import { fill, intlLocale, type Dict, type Locale } from "@/lib/i18n";
import { StarIcon } from "@/components/icons";

/** Note Google relevée à la main (data/site.json → rating), avec un lien vers la fiche. */
export function Rating({ lang, d, className = "" }: { lang: Locale; d: Dict; className?: string }) {
  const value = new Intl.NumberFormat(intlLocale[lang], { minimumFractionDigits: 1 }).format(site.rating.value);
  return (
    <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center gap-2 hover:underline ${className}`} aria-label={fill(d.rating.aria, { value, count: site.rating.count })}>
      <StarIcon className="h-4 w-4 text-brass" />
      <span>
        <span className="font-medium">{fill(d.rating.label, { value })}</span>
        <span className="text-muted"> · {fill(d.rating.count, { count: site.rating.count })}</span>
      </span>
    </a>
  );
}
