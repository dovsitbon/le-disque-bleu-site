import sizes from "@/data/media-sizes.json";

export type Img = { src: string; width: number; height: number };

const known = sizes as Record<string, number[]>;

/** Photo de public/media avec ses dimensions réelles (générées par npm run media). */
export function img(path: string): Img {
  const s = known[path];
  if (!s) throw new Error(`Image inconnue : ${path} (lancer npm run media)`);
  return { src: path, width: s[0], height: s[1] };
}

/** Première photo présente parmi plusieurs emplacements ; null s'il n'y en a encore aucune (illustration à la place). */
export function firstImg(paths: readonly string[]): Img | null {
  const p = paths.find((x) => x in known);
  return p ? img(p) : null;
}

/** Toutes les photos d'un dossier de public/media (ex. « galerie »). */
export const imgsIn = (cat: string): Img[] =>
  Object.keys(known)
    .filter((k) => k.startsWith(`/media/${cat}/`))
    .map(img);

/** La photo existe-t-elle dans public/media ? */
export const has = (path: string) => path in known;
