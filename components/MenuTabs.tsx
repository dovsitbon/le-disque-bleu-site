"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, useLocale } from "@/components/providers";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { categories, ITEMS, type CategoryId, type ItemId } from "@/lib/carte";
import { price } from "@/lib/format";
import { altOf, fill } from "@/lib/i18n";
import { has, img } from "@/lib/media";
import { pagePath } from "@/lib/pages";

/**
 * La carte, une seule page à onglets (midi, plats, burgers, salades, desserts, cocktails, boissons), en vrai HTML.
 * Les plats « à emporter » ont un bouton + qui remplit le panier (gardé dans le navigateur).
 * `limit` : nombre de plats montrés par onglet sur l'accueil (la page Carte montre tout).
 * L'adresse suit l'onglet (#cocktails…) pour pouvoir pointer dessus depuis le menu.
 */
export function MenuTabs({ limit, order = true }: { limit?: number; order?: boolean }) {
  const { lang, d } = useLocale();
  const { cart, add } = useCart();
  const cats = categories();
  const [tab, setTab] = useState<CategoryId>("midi");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (cats.some((c) => c.id === h)) setTab(h as CategoryId);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- les rubriques ne changent pas
  }, []);

  const select = (id: CategoryId) => {
    setTab(id);
    if (!limit) history.replaceState(null, "", `#${id}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const i = cats.findIndex((c) => c.id === tab);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? cats.length - 1 : -1;
    if (next < 0 || next >= cats.length) return;
    e.preventDefault();
    select(cats[next].id);
    tabsRef.current?.querySelector<HTMLButtonElement>(`#tab-${cats[next].id}`)?.focus();
  };

  // Les photos de la rubrique, en bandeau au-dessus de la liste (page Carte uniquement)
  const strip = (ids: ItemId[]) => {
    const shots = ids.flatMap((id) => {
      const src = ITEMS[id].photo;
      return src && has(src) ? [{ id, i: img(src) }] : [];
    });
    if (!shots.length) return null;
    return (
      <ul className="-mx-4 mb-7 flex gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        {shots.slice(0, 5).map(({ id, i }) => (
          <li key={id} className="w-[42vw] max-w-[15rem] shrink-0 md:w-auto md:max-w-[15rem] md:flex-1">
            <Image src={i.src} alt={altOf(d, i.src)} width={i.width} height={i.height} sizes="(min-width: 768px) 20vw, 42vw" quality={70} className="aspect-[4/5] w-full object-cover" />
            <p className="mt-2 text-[0.875rem] text-muted">{d.products[id].name}</p>
          </li>
        ))}
      </ul>
    );
  };

  const row = (id: ItemId) => {
    const qty = cart[id] ?? 0;
    const it = ITEMS[id];
    const p = d.products[id];
    return (
      <li key={id} className="flex items-center gap-4 border-b border-line py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-[family-name:var(--font-display)] text-[1.1875rem] leading-snug">{p.name}</h3>
            {it.price !== null && (
              <>
                <span className="dots" aria-hidden="true" />
                <span className="font-medium whitespace-nowrap tabular-nums">{price(it.price, lang)}</span>
              </>
            )}
          </div>
          {p.desc && <p className="mt-0.5 text-[0.9375rem] leading-snug text-muted">{p.desc}</p>}
          {it.tags.length > 0 && <p className="tag mt-1">{it.tags.map((t) => d.carte.tags[t]).join(" · ")}</p>}
        </div>
        {order && it.orderable && (
          <div className="flex shrink-0 items-center">
            {qty > 0 && (
              <>
                <button type="button" onClick={() => add(id, -1)} className="flex h-11 w-9 items-center justify-center text-blue" aria-label={fill(d.carte.removeAria, { name: p.name })}>
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="min-w-5 text-center font-medium tabular-nums" aria-label={fill(d.carte.inCart, { n: qty })}>
                  {qty}
                </span>
              </>
            )}
            <button type="button" onClick={() => add(id, 1)} className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${qty > 0 ? "border-blue bg-blue text-cream" : "border-[#b9ab90] text-blue hover:border-blue"}`} aria-label={fill(d.carte.addAria, { name: p.name })}>
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </li>
    );
  };

  return (
    <div>
      <div ref={tabsRef} role="tablist" aria-label={d.carte.tabsLabel} onKeyDown={onKey} className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        {cats.map((c) => (
          <button
            key={c.id}
            id={`tab-${c.id}`}
            role="tab"
            type="button"
            aria-selected={tab === c.id}
            aria-controls={`panel-${c.id}`}
            tabIndex={tab === c.id ? 0 : -1}
            onClick={() => select(c.id)}
            className={`-mb-px min-h-12 shrink-0 border-b-2 px-3.5 text-[1rem] whitespace-nowrap transition-colors md:px-5 ${tab === c.id ? "border-blue font-medium text-blue" : "border-transparent text-muted hover:text-ink"}`}
          >
            {d.carte.tabs[c.id]}
          </button>
        ))}
      </div>

      {cats.map((c) => {
        const items = limit ? c.items.slice(0, limit) : c.items;
        return (
          <div key={c.id} id={`panel-${c.id}`} role="tabpanel" aria-labelledby={`tab-${c.id}`} hidden={tab !== c.id} tabIndex={0} className="pt-6 focus-visible:outline-offset-8">
            {!limit && strip(c.items)}
            <p className="max-w-2xl text-[0.9375rem] text-muted">{d.carte.notes[c.id]}</p>
            <ul className="mt-4 grid gap-x-14 md:grid-cols-2">
              {items.map((id) => (
                row(id)
              ))}
            </ul>
            {limit && c.items.length > limit && (
              <Link href={`${pagePath("carte", lang)}#${c.id}`} className="link-line mt-6 inline-flex min-h-11 items-center font-medium">
                {d.carte.seeFull} · {d.carte.tabs[c.id]}
              </Link>
            )}
          </div>
        );
      })}
      <p className="mt-8 text-[0.9375rem] text-muted">{d.carte.priceNote}</p>
    </div>
  );
}

/** Rappel du panier, fixé en bas de la page Carte dès qu'un plat est ajouté. */
export function CartBar() {
  const { lang, d } = useLocale();
  const { count } = useCart();
  if (!count) return null;
  return (
    <div className="fade-in fixed inset-x-0 bottom-[4.75rem] z-40 px-3 md:bottom-5" role="status">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4 bg-blue-deep py-2.5 ps-5 pe-2.5 text-cream shadow-[0_6px_20px_rgba(30,27,24,0.18)]">
        <span className="text-[0.9375rem]">{count === 1 ? d.carte.cartBar.one : fill(d.carte.cartBar.many, { n: count })}</span>
        <Link href={pagePath("commander", lang)} className="btn-light !min-h-11 !px-4">
          {d.carte.cartCta}
        </Link>
      </div>
    </div>
  );
}
