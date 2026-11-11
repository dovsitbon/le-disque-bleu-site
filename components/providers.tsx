"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import { isItem, ITEMS, type ItemId } from "@/lib/carte";
import site from "@/data/site.json";

type LocaleCtx = { lang: Locale; d: Dict };
const LocaleContext = createContext<LocaleCtx | null>(null);

export function useLocale() {
  const v = useContext(LocaleContext);
  if (!v) throw new Error("useLocale hors de Providers");
  return v;
}

// Panier de la commande à emporter : rempli depuis la carte, gardé dans le navigateur (localStorage).
export type Cart = Partial<Record<ItemId, number>>;
type CartCtx = { cart: Cart; count: number; ready: boolean; add: (id: ItemId, delta: number) => void; clear: () => void };
const CartContext = createContext<CartCtx | null>(null);
const KEY = "disquebleu-panier";

export function useCart() {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart hors de Providers");
  return v;
}

const save = (c: Cart) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {}
};

export function Providers({ lang, d, children }: { lang: Locale; d: Dict; children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const clean: Cart = {};
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, unknown>;
      for (const [k, v] of Object.entries(raw)) if (isItem(k) && ITEMS[k].orderable && typeof v === "number" && v > 0) clean[k] = Math.min(Math.round(v), site.order.maxPerLine);
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lu dans le navigateur, après hydratation
    setCart(clean);
    setReady(true);
  }, []);

  const add = useCallback((id: ItemId, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const n = Math.min(Math.max((prev[id] ?? 0) + delta, 0), site.order.maxPerLine);
      if (n) next[id] = n;
      else delete next[id];
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setCart({});
    save({});
  }, []);

  const count = useMemo(() => Object.values(cart).reduce((a, b) => a + (b ?? 0), 0), [cart]);
  const locale = useMemo(() => ({ lang, d }), [lang, d]);
  const cartValue = useMemo(() => ({ cart, count, ready, add, clear }), [cart, count, ready, add, clear]);

  return (
    <LocaleContext.Provider value={locale}>
      <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
    </LocaleContext.Provider>
  );
}
