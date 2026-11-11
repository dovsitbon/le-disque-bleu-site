"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Apparition lente en fondu quand le bloc entre dans l'écran (IntersectionObserver + CSS, sans bibliothèque).
 * Le contenu reste visible sans JavaScript ou si l'utilisateur préfère réduire les animations (globals.css).
 * `as="li"` pour rester valide dans une liste.
 */
export function Reveal({ children, delay = 0, className = "", y = 24, as = "div" }: { children: ReactNode; delay?: number; className?: string; y?: number; as?: "div" | "li" }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  const style = { "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px` } as CSSProperties;
  return (
    <Tag ref={ref as never} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  );
}
