import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/data/site.json";
import { getDict, isLocale, locales, ogLocale, type Dict, type Locale } from "@/lib/i18n";
import { pageJsonLd } from "@/lib/jsonld";
import { pageOfSlug, pagePath, PAGE_IDS, SLUGS, type PageId } from "@/lib/pages";
import { MenuTabs, CartBar } from "@/components/MenuTabs";
import { OrderForm, PrivatForm, ResaForm } from "@/components/Forms";
import { Events } from "@/components/Events";
import { HoursTable } from "@/components/HoursTable";
import { OpenStatus } from "@/components/OpenStatus";
import { Rating } from "@/components/Rating";
import { Pic } from "@/components/Pic";
import { PhoneIcon } from "@/components/icons";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => PAGE_IDS.map((id) => ({ lang, slug: SLUGS[id][lang] })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const id = pageOfSlug(slug, lang);
  if (!id) return {};
  const p = getDict(lang).pages[id];
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDescription,
    alternates: {
      canonical: pagePath(id, lang),
      languages: { ...Object.fromEntries(locales.map((l) => [l, pagePath(id, l)])), "x-default": pagePath(id, "fr") },
    },
    openGraph: { type: "website", url: pagePath(id, lang), siteName: site.fullName, title: p.metaTitle, description: p.metaDescription, locale: ogLocale[lang], images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
    ...(id === "legal" ? { robots: { index: false, follow: true } } : {}),
  };
}

function PageHead({ d, id, lang, children }: { d: Dict; id: PageId; lang: Locale; children?: React.ReactNode }) {
  const p = d.pages[id];
  return (
    <header className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <nav aria-label={lang === "fr" ? "Fil d'Ariane" : "Breadcrumb"} className="text-[0.875rem] text-muted">
        <Link href={`/${lang}`} className="hover:underline">
          {d.nav.home}
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{p.title}</span>
      </nav>
      <h1 className="display mt-5 max-w-4xl text-[2.5rem] md:text-[4rem]">{p.h1}</h1>
      {p.intro && <p className="lead mt-5 max-w-2xl">{p.intro}</p>}
      {children}
    </header>
  );
}

/** Colonne d'infos à côté des formulaires : téléphone, horaires, statut en direct. */
function Aside({ d, lang }: { d: Dict; lang: Locale }) {
  return (
    <aside className="space-y-7 lg:sticky lg:top-28 lg:self-start">
      <div>
        <h2 className="caps mb-2.5 text-brass-ink">{d.infos.phone}</h2>
        <a href={`tel:${site.phoneIntl}`} className="inline-flex min-h-11 items-center gap-2.5 font-[family-name:var(--font-display)] text-[1.5rem]">
          <PhoneIcon className="h-5 w-5 text-blue" />
          {site.phone}
        </a>
      </div>
      <div>
        <h2 className="caps mb-2.5 text-brass-ink">{d.infos.hours}</h2>
        <HoursTable lang={lang} d={d} compact />
        <p className="mt-3 text-[0.9375rem]">
          <OpenStatus />
        </p>
      </div>
      <div>
        <h2 className="caps mb-2.5 text-brass-ink">{d.infos.address}</h2>
        <address className="not-italic">
          {site.address.street}
          <br />
          {site.address.postalCode} {site.address.city}
        </address>
      </div>
      <Rating lang={lang} d={d} className="text-[0.9375rem]" />
    </aside>
  );
}

const SEO_PHOTOS: Record<"restaurant" | "bar", string[]> = {
  restaurant: ["/media/plats/steak-oeuf-a-cheval.jpg", "/media/plats/burger-maison.jpg", "/media/terrasse/terrasse-soleil.jpg"],
  bar: ["/media/terrasse/terrasse-store-rouge.jpg", "/media/cocktails/mojito-spritz.jpg", "/media/cafe/petit-dejeuner.jpg"],
};

export default async function Page({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const id = pageOfSlug(slug, lang);
  if (!id) notFound();
  const d = getDict(lang);
  const jsonLd = <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(lang, id)) }} />;

  if (id === "carte")
    return (
      <>
        {jsonLd}
        <PageHead d={d} id={id} lang={lang} />
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-28 md:px-8 md:pb-32">
          <MenuTabs />
        </div>
        <CartBar />
      </>
    );

  if (id === "reserver" || id === "commander")
    return (
      <>
        {jsonLd}
        <PageHead d={d} id={id} lang={lang} />
        <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-10 pb-24 md:px-8 md:pt-14 md:pb-32 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
          <div className="max-w-2xl">{id === "reserver" ? <ResaForm /> : <OrderForm />}</div>
          <Aside d={d} lang={lang} />
        </div>
      </>
    );

  if (id === "privatiser")
    return (
      <>
        {jsonLd}
        <PageHead d={d} id={id} lang={lang} />
        <div className="mx-auto max-w-7xl px-4 pt-12 md:px-8 md:pt-16">
          <Events lang={lang} d={d} />
          <p className="mt-10 text-muted">
            {d.events.follow} :{" "}
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-line font-medium text-ink">
              @ledisquebleu_
            </a>
          </p>
        </div>
        <section id="demande" className="mx-auto grid max-w-7xl scroll-mt-24 gap-14 px-5 pt-20 pb-24 md:px-8 md:pt-28 md:pb-32 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
          <div className="max-w-2xl">
            <p className="eyebrow">{d.events.privat.eyebrow}</p>
            <h2 className="display mt-2 text-[2.125rem] md:text-[3rem]">{d.events.privat.title}</h2>
            <p className="lead mt-5 mb-10">{d.events.privat.text}</p>
            <PrivatForm />
          </div>
          <Aside d={d} lang={lang} />
        </section>
      </>
    );

  // Pages de texte : « Restaurant à Montmorency », « Bar et terrasse à Montmorency », mentions légales
  const p = d.pages[id] as Dict["pages"]["restaurant"];
  const photos = id === "legal" ? [] : SEO_PHOTOS[id];
  return (
    <>
      {jsonLd}
      <PageHead d={d} id={id} lang={lang}>
        {id !== "legal" && (
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link href={pagePath("reserver", lang)} className="btn">
              {p.cta}
            </Link>
            <Link href={id === "bar" ? `${pagePath("carte", lang)}#cocktails` : pagePath("carte", lang)} className="btn-line">
              {p.cta2}
            </Link>
            <Rating lang={lang} d={d} className="text-[0.9375rem]" />
          </div>
        )}
      </PageHead>
      <div className={`mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32 ${id === "legal" ? "pt-10" : "space-y-16 pt-14 md:space-y-24 md:pt-20"}`}>
        {p.sections.map((s, i) =>
          id === "legal" ? (
            <section key={s.h} className="max-w-3xl border-t border-line py-8">
              <h2 className="font-[family-name:var(--font-display)] text-[1.5rem]">{s.h}</h2>
              {s.p.map((x) => (
                <p key={x} className="mt-3 text-muted">
                  {x}
                </p>
              ))}
            </section>
          ) : (
            <section key={s.h} className="group grid items-center gap-8 md:grid-cols-2 md:gap-16 lg:gap-24">
              <Pic src={photos[i]} d={d} sizes="(min-width: 768px) 46vw, 100vw" priority={i === 0} className={`aspect-[4/3] md:aspect-[5/6] ${i % 2 ? "md:order-2" : ""}`} />
              <div className="md:max-w-lg">
                <h2 className="display text-[2rem] md:text-[2.75rem]">{s.h}</h2>
                {s.p.map((x) => (
                  <p key={x} className="lead mt-5">
                    {x}
                  </p>
                ))}
              </div>
            </section>
          ),
        )}
      </div>
    </>
  );
}
