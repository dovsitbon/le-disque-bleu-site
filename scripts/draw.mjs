// Outils de dessin partagés par les scripts (logo, image de partage, affichette) :
// texte converti en tracés (aucune police à installer), verre du logo, disque bleu.
import { readFile } from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";

export const ROOT = path.resolve(import.meta.dirname, "..");
export const C = { cream: "#F6F0E4", blue: "#1C3D6E", blueDeep: "#142C50", red: "#A63A2B", brass: "#B08D57", ink: "#1E1B18", muted: "#574F45" };

async function load(file) {
  const buf = await readFile(path.join(ROOT, "node_modules", file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export const fonts = {
  display: await load("@fontsource/playfair-display/files/playfair-display-latin-500-normal.woff"),
  text: await load("@fontsource/jost/files/jost-latin-400-normal.woff"),
  medium: await load("@fontsource/jost/files/jost-latin-500-normal.woff"),
};

/** Largeur d'un texte, interlettrage compris (tracking en em). */
export function width(font, text, size, tracking = 0) {
  return font.getAdvanceWidth(text, size) + tracking * size * (text.length - 1);
}

/** Texte en tracés SVG. anchor : start | middle | end. tracking en em. */
export function text(font, str, x, y, size, { fill = C.ink, anchor = "start", tracking = 0 } = {}) {
  const w = width(font, str, size, tracking);
  let cursor = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  let d = "";
  for (const ch of str) {
    d += font.getPath(ch, cursor, y, size).toPathData(2);
    cursor += font.getAdvanceWidth(ch, size) + tracking * size;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

/** Le verre du logo (dessiné dans une boîte 48 × 84), placé en (x, y) à l'échelle s. */
export function glass(x, y, s, { stroke = C.ink, wine = C.red } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none">
<path d="M11.2 33.5c3.9-2.6 8.6 2.2 14.3-.1 4.2-1.7 7.8-1.6 11.4-.2l.3 2.3a13.2 13.2 0 0 1-26.4 0z" fill="${wine}"/>
<path d="M14.5 3c-1.6 14-4 23.5-4 32.5a13.5 13.5 0 0 0 27 0c0-9-2.4-18.5-4-32.5" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round"/>
<path d="M24 49v27" stroke="${stroke}" stroke-width="2.4"/>
<path d="M12.5 78.5c2-2 6.5-2.8 11.5-2.8s9.500.8 11.5 2.8c-2 1.3-6.5 2-11.5 2s-9.500-.7-11.5-2z" fill="${stroke}"/></g>`;
}

/** Le disque bleu au trait (vinyle), centré en (cx, cy), rayon r. */
export function disc(cx, cy, r, { stroke = C.blue, fill = "none" } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${(r * 0.042).toFixed(2)}"/>
<circle cx="${cx}" cy="${cy}" r="${(r * 0.81).toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${(r * 0.017).toFixed(2)}" opacity=".55"/>
<circle cx="${cx}" cy="${cy}" r="${(r * 0.64).toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${(r * 0.017).toFixed(2)}" opacity=".55"/>`;
}

/** Logo complet, verre au-dessus, centré sur cx ; y = haut du verre ; size = hauteur des capitales « LE DISQUE BLEU ». */
export function logo(cx, y, size, { ink = C.ink, sub = C.red, wine = C.red } = {}) {
  const gs = (size * 3.1) / 84;
  return [
    glass(cx - 24 * gs, y, gs, { stroke: ink, wine }),
    text(fonts.display, "LE DISQUE BLEU", cx + size * 0.1, y + size * 3.1 + size * 1.55, size * 1.38, { fill: ink, anchor: "middle", tracking: 0.2 }),
    text(fonts.medium, "MONTMORENCY", cx + size * 0.11, y + size * 3.1 + size * 2.55, size * 0.5, { fill: sub, anchor: "middle", tracking: 0.44 }),
  ].join("");
}
