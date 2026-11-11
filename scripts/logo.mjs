// Logo du Disque Bleu, redessiné d'après sa photo de profil Instagram (assets/logo/logo-instagram.jpg) :
// un verre de vin rouge, « LE DISQUE BLEU » en capitales à empattements, « MONTMORENCY » en petit.
//   npm run logo
// → public/logo.svg (sur fond clair), public/logo-clair.svg (sur fond sombre),
//   app/icon.svg (favicon : le disque bleu et le verre), app/apple-icon.png (180 px), public/icon-512.png.
// Pour mettre son fichier d'origine : remplacez public/logo.svg et public/logo-clair.svg (mêmes noms).
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT, C, logo, glass, disc } from "./draw.mjs";

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;

await writeFile(path.join(ROOT, "public/logo.svg"), svg(520, 250, logo(260, 14, 36)));
await writeFile(path.join(ROOT, "public/logo-clair.svg"), svg(520, 250, logo(260, 14, 36, { ink: C.cream, sub: "#E6D9C2", wine: "#C9503E" })));

// Favicon : disque bleu plein, verre crème au centre
const mark = (size) => svg(size, size, `<g transform="scale(${size / 100})"><circle cx="50" cy="50" r="50" fill="${C.blue}"/><circle cx="50" cy="50" r="41" fill="none" stroke="${C.cream}" stroke-width="1" opacity=".45"/>${glass(33.200, 20.600, 0.7, { stroke: C.cream, wine: "#D1604D" })}</g>`);
await writeFile(path.join(ROOT, "app/icon.svg"), mark(100));
await sharp(Buffer.from(mark(512))).resize(180, 180).flatten({ background: C.blue }).png().toFile(path.join(ROOT, "app/apple-icon.png"));
await sharp(Buffer.from(mark(512))).png().toFile(path.join(ROOT, "public/icon-512.png"));

// Variante au trait (disque + verre), pour les documents imprimés
await writeFile(path.join(ROOT, "public/logo-disque.svg"), svg(200, 200, `<g transform="scale(2)">${disc(50, 50, 47)}${glass(38.500, 29, 0.48)}</g>`));
console.log("logo.svg, logo-clair.svg, logo-disque.svg, icon.svg, apple-icon.png, icon-512.png écrits");
