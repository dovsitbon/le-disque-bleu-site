import site from "@/data/site.json";
import hours from "@/data/horaires.json";
import { getDict, locales, type Locale } from "@/lib/i18n";
import { weekHours } from "@/lib/hours";
import { categories, ITEMS } from "@/lib/carte";
import { pagePath, type PageId } from "@/lib/pages";

const BUSINESS = `${site.url}/#restaurant`;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function menu(lang: Locale) {
  const d = getDict(lang);
  return {
    "@type": "Menu",
    "@id": `${site.url}${pagePath("carte", lang)}#menu`,
    name: d.pages.carte.title,
    inLanguage: lang,
    hasMenuSection: categories().map((c) => ({
      "@type": "MenuSection",
      name: d.carte.tabs[c.id],
      hasMenuItem: c.items.map((id) => {
        const it = ITEMS[id];
        const p = d.products[id];
        return {
          "@type": "MenuItem",
          name: p.name,
          ...(p.desc ? { description: p.desc } : {}),
          ...(it.price !== null ? { offers: { "@type": "Offer", price: it.price.toFixed(2), priceCurrency: "EUR" } } : {}),
        };
      }),
    })),
  };
}

const spec = (slots: string[][], i: number, extra: object = {}) => slots.map(([opens, closes]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAYS[i]}`, opens, closes, ...extra }));

function business(lang: Locale) {
  const d = getDict(lang);
  const summer = hours.summer;
  const summerWeek = [1, 2, 3, 4, 5, 6, 7].map((n) => (summer.week as unknown as Record<string, string[][]>)[String(n)] ?? []);
  return {
    "@type": ["Restaurant", "BarOrPub"],
    "@id": BUSINESS,
    name: site.name,
    alternateName: ["Le Disque Bleu Montmorency", "Disque Bleu"],
    description: d.meta.description,
    url: `${site.url}/${lang}`,
    image: [`${site.url}/og.jpg`],
    logo: `${site.url}/icon-512.png`,
    telephone: site.phoneIntl,
    ...(site.email ? { email: site.email } : {}),
    priceRange: site.priceRange,
    servesCuisine: lang === "fr" ? ["Française", "Brasserie", "Burgers", "Plat du jour"] : ["French", "Brasserie", "Burgers", "Dish of the day"],
    address: { "@type": "PostalAddress", streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.city, addressRegion: site.address.region, addressCountry: site.address.country },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: [
      ...weekHours().flatMap((slots, i) => spec(slots, i)),
      // Horaires d'été (jusqu'à 22 h), valables sur la période indiquée dans data/horaires.json
      ...(summer.enabled ? summerWeek.flatMap((slots, i) => spec(slots, i, { validFrom: summer.from, validThrough: summer.to })) : []),
    ],
    // Note Google relevée à la main, avec sa date (data/site.json → rating.checked)
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating.value, reviewCount: site.rating.count, bestRating: 5, worstRating: 1, dateModified: site.rating.checked },
    sameAs: [site.instagram],
    acceptsReservations: true,
    currenciesAccepted: "EUR",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: lang === "fr" ? "Terrasse" : "Terrace", value: true },
      { "@type": "LocationFeatureSpecification", name: lang === "fr" ? "Vente à emporter" : "Takeaway", value: true },
      { "@type": "LocationFeatureSpecification", name: lang === "fr" ? "Tabac" : "Tobacconist", value: true },
    ],
    hasMenu: { "@id": `${site.url}${pagePath("carte", lang)}#menu` },
    potentialAction: [
      { "@type": "ReserveAction", target: `${site.url}${pagePath("reserver", lang)}` },
      { "@type": "OrderAction", target: `${site.url}${pagePath("commander", lang)}`, deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModePickUp" },
    ],
  };
}

/** Données structurées de l'accueil : restaurant et bar (horaires, note Google), menu, FAQ. */
export function homeJsonLd(lang: Locale) {
  const d = getDict(lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, inLanguage: [...locales], publisher: { "@id": BUSINESS } },
      business(lang),
      menu(lang),
      { "@type": "FAQPage", mainEntity: d.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
}

/** Données structurées d'une page secondaire, plus fil d'Ariane. */
export function pageJsonLd(lang: Locale, id: PageId) {
  const d = getDict(lang);
  const url = `${site.url}${pagePath(id, lang)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      business(lang),
      ...(id === "carte" ? [menu(lang)] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: `${site.url}/${lang}` },
          { "@type": "ListItem", position: 2, name: d.pages[id].title, item: url },
        ],
      },
    ],
  };
}
