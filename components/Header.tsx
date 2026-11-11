"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import site from "@/data/site.json";
import { Logo } from "@/components/Logo";
import { LangSwitch } from "@/components/LangSwitch";
import { BagIcon, CloseIcon, MenuIcon, PhoneIcon } from "@/components/icons";
import { useCart, useLocale } from "@/components/providers";
import { fill } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";

export function Header() {
  const { lang, d } = useLocale();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const home = `/${lang}`;
  const carte = pagePath("carte", lang);
  const links = [
    { href: carte, label: d.nav.carte },
    { href: `${home}#plat-du-jour`, label: d.nav.pdj },
    { href: `${carte}#cocktails`, label: d.nav.cocktails },
    { href: `${home}#soirees`, label: d.nav.soirees },
    { href: `${home}#infos`, label: d.nav.infos },
  ];
  // Raccourcis du menu mobile : Réserver, Commander, Privatiser (+ Bon cadeau quand le lien est configuré)
  const shortcuts = [
    { href: pagePath("reserver", lang), label: d.nav.reserve },
    { href: pagePath("commander", lang), label: d.nav.order },
    { href: pagePath("privatiser", lang), label: d.nav.privat },
    ...(site.giftCardUrl ? [{ href: site.giftCardUrl, label: d.nav.gift }] : []),
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 bg-cream/95 backdrop-blur-sm transition-shadow duration-300 ${scrolled ? "shadow-[0_1px_0_var(--color-line)]" : ""}`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-10 focus:bg-cream focus:px-4 focus:py-2">
          {d.nav.skip}
        </a>
        <div className="flex h-16 items-center gap-3 px-4 md:h-[4.75rem] md:px-6 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:px-8">
          <nav aria-label={d.nav.carte} className="hidden items-center gap-6 text-[0.9375rem] xl:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="py-2 whitespace-nowrap underline-offset-[0.45em] hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href={home} aria-label={`${site.name}, ${d.nav.home}`} className="me-auto xl:me-0">
            <Logo />
          </Link>
          <div className="flex items-center gap-1 md:gap-4 xl:justify-end">
            <LangSwitch lang={lang} label={d.nav.lang} className="hidden md:flex" />
            <a href={`tel:${site.phoneIntl}`} className="hidden items-center gap-2 text-[0.9375rem] whitespace-nowrap hover:underline lg:inline-flex">
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
            {count > 0 && (
              <Link href={pagePath("commander", lang)} className="relative flex h-11 w-11 items-center justify-center" aria-label={fill(d.nav.cart, { n: count })}>
                <BagIcon className="h-6 w-6" />
                <span className="absolute end-0.5 top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red px-1 text-[0.6875rem] leading-none font-medium text-cream">{count}</span>
              </Link>
            )}
            <Link href={pagePath("reserver", lang)} className="btn hidden !min-h-11 !px-5 md:inline-flex">
              {d.nav.reserve}
            </Link>
            <button type="button" className="flex h-11 w-11 items-center justify-center xl:hidden" aria-label={d.nav.menu} aria-expanded={menu} aria-controls="menu-mobile" onClick={() => setMenu(true)}>
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div id="menu-mobile" role="dialog" aria-modal="true" aria-label={d.nav.menu} className="fade-in fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-cream px-5 pb-8">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Logo />
            <button type="button" autoFocus className="flex h-11 w-11 items-center justify-center" aria-label={d.nav.close} onClick={() => setMenu(false)}>
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <nav aria-label={d.nav.carte} className="mt-4 flex flex-col border-t border-line">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenu(false)} className="display border-b border-line py-4 text-[1.625rem]">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-7 flex flex-col gap-3">
            {shortcuts.map((s, i) => (
              <Link key={s.href} href={s.href} onClick={() => setMenu(false)} className={i === 0 ? "btn" : "btn-line"}>
                {s.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between pt-8">
            <a href={`tel:${site.phoneIntl}`} className="inline-flex min-h-11 items-center gap-2 font-medium">
              <PhoneIcon className="h-5 w-5" />
              {site.phone}
            </a>
            <LangSwitch lang={lang} label={d.nav.lang} />
          </div>
        </div>
      )}
    </>
  );
}

/** Barre fixée en bas de l'écran sur mobile : « Réserver une table » toujours sous le pouce, et « Appeler ». Masquée sur les pages de formulaire. */
export function MobileBar() {
  const { lang, d } = useLocale();
  const pathname = usePathname() ?? "";
  const onForm = [pagePath("reserver", lang), pagePath("commander", lang)].some((p) => pathname.startsWith(p));
  if (onForm) return null;
  return (
    <>
      <div className="h-[4.5rem] md:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-cream/97 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
        <a href={`tel:${site.phoneIntl}`} className="btn-line !px-4" aria-label={`${d.nav.call} ${site.phone}`}>
          <PhoneIcon className="h-5 w-5" />
          {d.nav.call}
        </a>
        <Link href={pagePath("reserver", lang)} className="btn flex-1">
          {d.nav.reserve}
        </Link>
      </div>
    </>
  );
}
