import Link from "next/link";
import site from "@/data/site.json";
import type { Dict, Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";
import { Logo } from "@/components/Logo";
import { HoursTable } from "@/components/HoursTable";
import { InstagramIcon, PhoneIcon } from "@/components/icons";

export function Footer({ lang, d }: { lang: Locale; d: Dict }) {
  const links = [
    { href: pagePath("carte", lang), label: d.nav.carte },
    { href: pagePath("reserver", lang), label: d.nav.reserve },
    { href: pagePath("commander", lang), label: d.nav.order },
    { href: pagePath("privatiser", lang), label: d.pages.privatiser.title },
    { href: pagePath("restaurant", lang), label: d.pages.restaurant.title },
    { href: pagePath("bar", lang), label: d.pages.bar.title },
    ...(site.giftCardUrl ? [{ href: site.giftCardUrl, label: d.nav.gift }] : []),
  ];
  return (
    <footer className="bg-blue-deep text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-[1.1fr_1fr_1fr_0.9fr] lg:gap-10 lg:py-20">
        <div>
          <Logo stacked light className="!items-start" />
          <p className="mt-6 max-w-xs text-[0.9375rem] text-cream/75">{d.footer.tagline}</p>
        </div>
        <div>
          <h2 className="caps text-cream/65">{d.footer.contact}</h2>
          <address className="mt-4 leading-relaxed not-italic">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </address>
          <a href={`tel:${site.phoneIntl}`} className="mt-3 inline-flex min-h-11 items-center gap-2 hover:underline">
            <PhoneIcon className="h-4 w-4" />
            {site.phone}
          </a>
          <br />
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 hover:underline">
            <InstagramIcon className="h-4 w-4" />
            @ledisquebleu_
          </a>
        </div>
        <div className="[&_td]:!text-cream/85 [&_tr]:!border-cream/15">
          <h2 className="caps mb-3 text-cream/65">{d.footer.hours}</h2>
          <HoursTable lang={lang} d={d} compact />
          <p className="mt-3 text-[0.875rem] text-cream/70">{d.infos.summer}</p>
        </div>
        <nav aria-label={d.footer.explore}>
          <h2 className="caps text-cream/65">{d.footer.explore}</h2>
          <ul className="mt-2.5">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-10 items-center hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[0.8125rem] text-cream/65 md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. {d.footer.rights}{" "}
            <Link href={pagePath("legal", lang)} className="underline underline-offset-4 hover:text-cream">
              {d.footer.legal}
            </Link>
          </p>
          <p>{d.footer.alcohol}</p>
        </div>
      </div>
    </footer>
  );
}
