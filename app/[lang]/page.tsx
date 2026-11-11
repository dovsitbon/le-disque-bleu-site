import Link from "next/link";
import site from "@/data/site.json";
import avis from "@/data/avis.json";
import pdj from "@/data/plat-du-jour.json";
import { getDict, fill, intlLocale, isLocale } from "@/lib/i18n";
import { isoDay, price } from "@/lib/format";
import { pagePath } from "@/lib/pages";
import { homeJsonLd } from "@/lib/jsonld";
import { Reveal } from "@/components/Reveal";
import { Rating } from "@/components/Rating";
import { OpenStatus } from "@/components/OpenStatus";
import { MenuTabs, CartBar } from "@/components/MenuTabs";
import { HoursTable } from "@/components/HoursTable";
import { Events } from "@/components/Events";
import { Pic } from "@/components/Pic";
import { Disc, Glass } from "@/components/Logo";
import { BagIcon, InstagramIcon, PhoneIcon, PinIcon, PlusIcon } from "@/components/icons";

// Le statut « Ouvert » et le bandeau se recalculent côté navigateur ; la page (plat du jour, soirées) est régénérée chaque heure.
export const revalidate = 3600;

function Head({ eyebrow, title, intro, center = false }: { eyebrow: string; title: string; intro?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display mt-2 text-[2.25rem] md:text-[3.25rem]">{title}</h2>
      {intro && <p className="lead mt-5">{intro}</p>}
    </Reveal>
  );
}

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
// Les 4 pictos de la bande de services : horloge, table de terrasse sous son store, sac à emporter, verre
const SERVICE_ICONS = [
  <svg key="clock" viewBox="0 0 32 32" className="h-9 w-9" {...line}>
    <circle cx="16" cy="16" r="11.5" />
    <path d="M16 9v7l4.500 3" />
  </svg>,
  <svg key="table" viewBox="0 0 32 32" className="h-9 w-9" {...line}>
    <path d="M3 9h26l-3-5H6L3 9Zm0 0v2.500M29 9v2.500" />
    <ellipse cx="16" cy="18.500" rx="8" ry="1.800" />
    <path d="M16 20.300V28m-4 0h8" />
  </svg>,
  <BagIcon key="bag" className="h-9 w-9" />,
  <Glass key="glass" className="h-9 w-auto" />,
];

const TILES = [
  { key: "pdj", photo: "/media/plats/andouillette.jpg", to: "home#plat-du-jour" },
  { key: "plats", photo: "/media/plats/pates-pesto.jpg", to: "carte#plats" },
  { key: "salades", photo: "/media/plats/salade-poulet.jpg", to: "carte#salades" },
  { key: "desserts", photo: "/media/desserts/creme-brulee.jpg", to: "carte#desserts" },
  { key: "cocktails", photo: "/media/cocktails/sirops.jpg", to: "carte#cocktails" },
  { key: "cafe", photo: "/media/cafe/petit-dejeuner.jpg", to: "carte#boissons" },
] as const;

const BLOCKS = [
  { id: "fait-maison", key: "maison", photo: "/media/plats/burger-maison.jpg", to: "carte" },
  { id: "terrasse", key: "terrasse", photo: "/media/terrasse/table-terrasse.jpg", to: "reserver" },
  { id: "bar", key: "bar", photo: "/media/cocktails/mojito-spritz.jpg", to: "carte#cocktails" },
] as const;

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const d = getDict(lang);
  const carte = pagePath("carte", lang);
  const reserver = pagePath("reserver", lang);
  const href = (to: string) => (to.startsWith("home") ? `/${lang}${to.slice(4)}` : to.startsWith("carte") ? `${carte}${to.slice(5)}` : pagePath(to as "reserver", lang));
  const ratingValue = new Intl.NumberFormat(intlLocale[lang], { minimumFractionDigits: 1 }).format(site.rating.value);
  const reviews = avis.items as { author: string; date: string; source: string; fr: string; en: string }[];
  const today = (pdj.days as { date: string; price: number | null; dish: { fr: string; en: string } }[]).find((x) => x.date === isoDay(new Date()));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(lang)) }} />

      {/* Hero : une photo forte, deux boutons, la note Google et le statut en direct */}
      <section className="grid lg:min-h-[calc(100svh-7.25rem)] lg:grid-cols-[1fr_1.08fr]">
        <div className="order-2 flex flex-col justify-center px-5 pt-9 pb-14 md:px-10 lg:order-1 lg:py-16 xl:px-20">
          <p className="sign rise leading-relaxed text-brass-ink">{d.hero.eyebrow}</p>
          <h1 className="display rise mt-5 text-[2.875rem] md:text-[4.25rem] xl:text-[5.25rem]" style={{ animationDelay: "0.06s" }}>
            {d.hero.title}
          </h1>
          <p className="lead rise mt-6 max-w-lg" style={{ animationDelay: "0.12s" }}>
            {d.hero.sub}
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.18s" }}>
            <Link href={reserver} className="btn">
              {d.hero.ctaReserve}
            </Link>
            <Link href={carte} className="btn-line">
              {d.hero.ctaMenu}
            </Link>
          </div>
          <div className="rise mt-7 flex flex-col gap-2 text-[0.9375rem] sm:flex-row sm:flex-wrap sm:gap-x-7" style={{ animationDelay: "0.24s" }}>
            <Rating lang={lang} d={d} />
            <OpenStatus />
          </div>
        </div>
        <Pic src="/media/hero/hero.jpg" d={d} sizes="(min-width: 1024px) 52vw, 100vw" priority position="50% 62%" className="order-1 h-[46svh] lg:order-2 lg:h-auto" />
      </section>

      {/* Tuiles de catégories, juste après le hero */}
      <section aria-labelledby="tuiles" className="px-4 pt-6 md:px-8 md:pt-8">
        <h2 id="tuiles" className="sr-only">
          {d.tiles.title}
        </h2>
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-4">
          {TILES.map((t, i) => (
            <Reveal as="li" key={t.key} delay={i * 0.04}>
              <Link href={href(t.to)} className="group block">
                <Pic src={t.photo} d={d} sizes="(min-width: 1024px) 16vw, (min-width: 640px) 31vw, 47vw" className="aspect-[4/5]" />
                <span className="mt-3 flex items-baseline justify-between gap-2 border-b border-line pb-2.5 font-[family-name:var(--font-display)] text-[1.0625rem] leading-tight group-hover:border-ink">{d.tiles.items[t.key]}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Bande de services en 4 pictos */}
      <section aria-labelledby="services" className="px-5 pt-16 md:px-8 md:pt-24">
        <h2 id="services" className="sr-only">
          {d.services.title}
        </h2>
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 border-y border-line py-10 lg:grid-cols-4 lg:py-12">
          {d.services.items.map((s, i) => (
            <li key={s.title} className="flex flex-col items-start">
              <span className="text-blue">{SERVICE_ICONS[i]}</span>
              <p className="mt-4 font-[family-name:var(--font-display)] text-[1.1875rem] leading-snug">{s.title}</p>
              <p className="mt-1.5 text-[0.9375rem] text-muted">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Le plat du jour : l'ardoise de la maison (data/plat-du-jour.json) */}
      <section id="plat-du-jour" className="scroll-mt-24 px-4 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[0.9fr_1.1fr]">
          <Pic src="/media/plats/piece-du-boucher.jpg" d={d} sizes="(min-width: 768px) 42vw, 100vw" className="aspect-[4/3] md:aspect-auto md:min-h-[30rem]" />
          <Reveal className="flex flex-col justify-center bg-ink px-6 py-12 text-cream md:px-14 md:py-16">
            <p className="font-[family-name:var(--font-display)] text-[1.125rem] text-[#e0b9a0] italic">{d.pdj.eyebrow}</p>
            <h2 className="display mt-2 text-[2.25rem] md:text-[3.25rem]">{d.pdj.title}</h2>
            <div className="rule mt-7 max-w-md" aria-hidden="true">
              <Disc className="h-5 w-5" glass={false} />
            </div>
            {today ? (
              <p className="mt-7 max-w-md">
                <span className="caps block text-cream/65">{d.pdj.todayLabel}</span>
                <span className="mt-2 block font-[family-name:var(--font-display)] text-[1.625rem] leading-snug italic">{today.dish[lang]}</span>
                {today.price !== null && <span className="mt-2 block text-[1.125rem]">{price(today.price, lang)}</span>}
              </p>
            ) : (
              <p className="mt-7 max-w-md font-[family-name:var(--font-display)] text-[1.375rem] leading-snug italic">{pdj.fallback[lang]}</p>
            )}
            <p className="mt-6 max-w-md text-cream/80">{d.pdj.text}</p>
            <p className="mt-2 max-w-md text-cream/80">{d.pdj.monday}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={reserver} className="btn-light">
                {d.pdj.cta}
              </Link>
              <a href={`tel:${site.phoneIntl}`} className="btn-line !border-cream/50 !text-cream hover:!bg-cream hover:!text-ink">
                <PhoneIcon className="h-5 w-5" />
                {d.pdj.call}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* La carte : une seule page à onglets, en vrai HTML */}
      <section id="carte" className="scroll-mt-24 px-4 pt-24 md:px-8 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <Head eyebrow={d.carte.eyebrow} title={d.carte.title} intro={d.carte.intro} />
            <Link href={carte} className="link-line inline-flex min-h-11 shrink-0 items-center self-start font-medium md:self-auto">
              {d.carte.seeFull}
            </Link>
          </div>
          <MenuTabs limit={6} />
        </div>
      </section>

      {/* Trois blocs alternés : photo, texte court, un seul bouton */}
      <div className="space-y-20 px-4 pt-24 md:space-y-28 md:px-8 md:pt-32">
        {BLOCKS.map((b, i) => {
          const t = d.blocks[b.key];
          return (
            <section key={b.id} id={b.id} className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-8 md:grid-cols-2 md:gap-16 lg:gap-24">
              <Reveal className={`group ${i % 2 ? "md:order-2" : ""}`}>
                <Pic src={b.photo} d={d} sizes="(min-width: 768px) 46vw, 100vw" className="aspect-[4/3] md:aspect-[5/6]" />
              </Reveal>
              <Reveal delay={0.06} className="md:max-w-md">
                <p className="eyebrow">{t.eyebrow}</p>
                <h2 className="display mt-2 text-[2.125rem] md:text-[3rem]">{t.title}</h2>
                <p className="lead mt-5">{t.text}</p>
                <Link href={href(b.to)} className={`mt-8 ${b.key === "terrasse" ? "btn" : "btn-line"}`}>
                  {t.cta}
                </Link>
              </Reveal>
            </section>
          );
        })}
      </div>

      {/* Soirées et événements, puis privatisation */}
      <section id="soirees" className="scroll-mt-24 px-4 pt-24 md:px-8 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <Head eyebrow={d.events.eyebrow} title={d.events.title} intro={d.events.intro} />
          <div className="mt-12">
            <Events lang={lang} d={d} />
          </div>
          <p className="mt-8 text-muted">
            {d.events.follow} :{" "}
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-line font-medium text-ink">
              @ledisquebleu_
            </a>
          </p>
          <Reveal className="mt-16 grid gap-8 bg-blue px-6 py-12 text-cream md:mt-20 md:grid-cols-[1.3fr_auto] md:items-center md:gap-14 md:px-14 md:py-16">
            <div className="max-w-2xl">
              <p className="font-[family-name:var(--font-display)] text-[1.125rem] text-[#c9d3e3] italic">{d.events.privat.eyebrow}</p>
              <h3 className="display mt-2 text-[2rem] md:text-[2.75rem]">{d.events.privat.title}</h3>
              <p className="mt-4 text-[1.0625rem] text-cream/85">{d.events.privat.text}</p>
            </div>
            <Link href={`${pagePath("privatiser", lang)}#demande`} className="btn-light justify-self-start">
              {d.events.privat.cta}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* La maison, l'équipe */}
      <section id="maison" className="px-5 pt-24 md:px-8 md:pt-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Disc className="mx-auto h-16 w-16 text-blue" />
          <p className="eyebrow mt-6">{d.team.eyebrow}</p>
          <h2 className="display mt-2 text-[2.25rem] md:text-[3.25rem]">{d.team.title}</h2>
          {d.team.text.map((p) => (
            <p key={p} className="lead mt-5">
              {p}
            </p>
          ))}
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-line mt-7 inline-flex min-h-11 items-center gap-2 font-medium">
            <InstagramIcon className="h-[18px] w-[18px]" />
            {d.team.cta}
          </a>
        </Reveal>
      </section>

      {/* Avis : la note Google ; les vrais avis s'ajoutent dans data/avis.json (aucun inventé) */}
      <section id="avis" className="px-4 pt-24 md:px-8 md:pt-32">
        <div hidden dangerouslySetInnerHTML={{ __html: "<!-- À REMPLIR avec de vrais avis clients (data/avis.json), avec l'accord du restaurant -->" }} />
        <Reveal className="mx-auto grid max-w-7xl gap-8 border-y border-line py-12 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-14 md:py-14">
          <p className="display text-[4.5rem] leading-none text-blue md:text-[6rem]">
            {ratingValue}
            <span className="text-[0.4em] text-muted">/5</span>
          </p>
          <div className="max-w-xl">
            <p className="eyebrow">{d.reviews.eyebrow}</p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.5rem] leading-snug">{fill(d.reviews.title, { value: ratingValue, count: site.rating.count })}</h2>
            <p className="mt-2 text-muted">{d.reviews.text}</p>
          </div>
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line justify-self-start">
            {d.reviews.cta}
          </a>
        </Reveal>
        {reviews.length > 0 && (
          <ul className="mx-auto mt-10 grid max-w-7xl gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.author + r.date} className="border-s border-brass ps-5">
                <p className="font-[family-name:var(--font-display)] text-[1.125rem] leading-relaxed italic">« {r[lang]} »</p>
                <p className="mt-3 text-sm text-muted">
                  {r.author} · {r.source}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Infos pratiques */}
      <section id="infos" className="scroll-mt-24 px-4 pt-24 md:px-8 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <Head eyebrow={d.infos.eyebrow} title={d.infos.title} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal className="space-y-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="caps mb-2.5 text-brass-ink">{d.infos.address}</h3>
                  <address className="text-[1.125rem] not-italic">
                    {site.address.street}
                    <br />
                    {site.address.postalCode} {site.address.city}
                  </address>
                </div>
                <div>
                  <h3 className="caps mb-2.5 text-brass-ink">{d.infos.phone}</h3>
                  <a href={`tel:${site.phoneIntl}`} className="link-line text-[1.125rem]">
                    {site.phone}
                  </a>
                </div>
              </div>
              <div>
                <h3 className="caps mb-2.5 text-brass-ink">{d.infos.hours}</h3>
                <HoursTable lang={lang} d={d} />
                <p className="mt-3 text-[0.9375rem] text-muted">{d.infos.summer}</p>
                <p className="mt-3">
                  <OpenStatus className="font-medium" />
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="caps mb-2.5 text-brass-ink">{d.infos.access}</h3>
                  <p className="text-muted">{d.infos.accessText}</p>
                </div>
                <div>
                  <h3 className="caps mb-2.5 text-brass-ink">{d.infos.servicesTitle}</h3>
                  <ul className="text-muted">
                    {d.infos.servicesList.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={`tel:${site.phoneIntl}`} className="btn">
                  <PhoneIcon className="h-5 w-5" />
                  {d.nav.call}
                </a>
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
                  <PinIcon className="h-5 w-5" />
                  {d.infos.route}
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.06} className="flex flex-col gap-4">
              <Pic src="/media/facade/facade-soir.jpg" d={d} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[16/10]" position="50% 30%" />
              <iframe title={d.infos.mapTitle} src={site.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="min-h-80 w-full flex-1 border-0 grayscale-[0.35]" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Head eyebrow={d.faq.eyebrow} title={d.faq.title} />
          <Reveal delay={0.06}>
            <div className="divide-y divide-line border-y border-line">
              {d.faq.items.map((f) => (
                <details key={f.q}>
                  <summary className="flex min-h-16 items-center justify-between gap-6 py-4 font-[family-name:var(--font-display)] text-[1.1875rem] leading-snug">
                    {f.q}
                    <PlusIcon className="faq-plus h-5 w-5 shrink-0 text-blue" />
                  </summary>
                  <p className="max-w-2xl pb-6 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <CartBar />
    </>
  );
}
