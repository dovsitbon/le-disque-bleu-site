// Photos du site.
//   npm run media
//
// 1. Prépare pour le web toutes les photos de assets/<dossier>/ dans public/media/<dossier>/
//    (next/image sert ensuite AVIF/WebP à la bonne taille) et note leurs dimensions dans data/media-sizes.json.
// 2. Fabrique l'image de partage public/og.jpg (1200 × 630).
//
// Pour ajouter une photo prise sur place : déposez-la sous le nom attendu (voir assets/A-PHOTOGRAPHIER.md),
// par ex. assets/salle/salle.jpg, puis relancez « npm run media » : le disque qui tenait la place disparaît.
// assets/raw/ : images brutes d'Instagram (non publiées telles quelles), triées dans les dossiers ci-dessus.
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT, C, fonts, text, logo } from "./draw.mjs";

const CATS = ["hero", "plats", "desserts", "cocktails", "cafe", "terrasse", "soirees", "salle", "bar", "facade", "equipe"];

const sizes = {};
for (const cat of CATS) {
  const dir = path.join(ROOT, "assets", cat);
  await mkdir(dir, { recursive: true });
  await mkdir(path.join(ROOT, "public/media", cat), { recursive: true });
  for (const f of (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    const name = f.replace(/\.\w+$/, "").toLowerCase();
    const max = cat === "hero" ? 2400 : 1600;
    const info = await sharp(path.join(dir, f))
      .rotate()
      .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(path.join(ROOT, "public/media", cat, `${name}.jpg`));
    sizes[`/media/${cat}/${name}.jpg`] = [info.width, info.height];
  }
}
await writeFile(path.join(ROOT, "data/media-sizes.json"), JSON.stringify(sizes, null, 1) + "\n");

// Image de partage : à droite la photo du hero, à gauche le logo et l'essentiel
const right = await sharp(path.join(ROOT, "assets/hero/hero.jpg")).rotate().resize(540, 630, { fit: "cover", position: "south" }).toBuffer();
const left = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="660" height="630">
${logo(330, 96, 34)}
<rect x="300" y="352" width="60" height="1.500" fill="${C.brass}"/>
${text(fonts.display, "La brasserie de la place", 330, 422, 40, { anchor: "middle" })}
${text(fonts.text, "Restaurant · Bar · Tabac", 330, 474, 23, { anchor: "middle", fill: C.muted })}
${text(fonts.text, "8 place Roger Levanneur · 01 75 40 78 27", 330, 512, 23, { anchor: "middle", fill: C.muted })}
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: C.cream } })
  .composite([
    { input: right, left: 660, top: 0 },
    { input: left, left: 0, top: 0 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og.jpg"));

console.log(`${Object.keys(sizes).length} photos prêtes, og.jpg écrit`);
