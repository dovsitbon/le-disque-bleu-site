// Affichette A5 à poser sur les tables et en vitrine, avec un QR code vers le site.
//   npm run affichette
// → print/affichette-a5.pdf (148 × 210 mm, 300 dpi) et print/affichette-a5.png (aperçu).
// L'adresse du QR code vient de data/site.json → url : relancez le script si le nom de domaine change.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import QRCode from "qrcode";
import { PDFDocument } from "pdf-lib";
import { ROOT, C, fonts, text, logo, disc } from "./draw.mjs";

const site = JSON.parse(await readFile(path.join(ROOT, "data/site.json"), "utf8"));
const W = 1748;
const H = 2480;
const cx = W / 2;

// QR code dessiné en carrés (niveau de correction élevé : il reste lisible même un peu taché)
const qr = QRCode.create(site.url, { errorCorrectionLevel: "H" });
const n = qr.modules.size;
const QR = 560;
const cell = QR / n;
const qx = cx - QR / 2;
const qy = 1530;
let squares = "";
for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.modules.get(r, c)) squares += `<rect x="${(qx + c * cell).toFixed(2)}" y="${(qy + r * cell).toFixed(2)}" width="${(cell + 0.5).toFixed(2)}" height="${(cell + 0.5).toFixed(2)}"/>`;

const photoH = 760;
const photoY = 560;
const photo = await sharp(path.join(ROOT, "assets/hero/hero.jpg")).rotate().resize(W - 240, photoH, { fit: "cover", position: "south" }).toBuffer();

const host = site.url.replace(/^https?:\/\//, "");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${C.cream}"/>
<rect x="60" y="60" width="${W - 120}" height="${H - 120}" fill="none" stroke="${C.brass}" stroke-width="3"/>
${logo(cx, 150, 62)}
${text(fonts.display, "La carte, le plat du jour, la réservation", cx, photoY + photoH + 130, 64, { anchor: "middle" })}
${text(fonts.text, "Scannez pour tout voir sur votre téléphone", cx, photoY + photoH + 200, 38, { anchor: "middle", fill: C.muted })}
<rect x="${qx - 36}" y="${qy - 36}" width="${QR + 72}" height="${QR + 72}" fill="#FFFFFF"/>
<g fill="${C.blueDeep}">${squares}</g>
${text(fonts.medium, host, cx, qy + QR + 120, 40, { anchor: "middle", fill: C.blue, tracking: 0.04 })}
${text(fonts.text, `${site.address.street}, ${site.address.city}  ·  ${site.phone}`, cx, qy + QR + 190, 34, { anchor: "middle", fill: C.muted })}
${disc(200, qy + QR / 2, 54)}
${disc(W - 200, qy + QR / 2, 54)}
</svg>`;

const png = await sharp(Buffer.from(svg))
  .composite([{ input: photo, left: 120, top: photoY }])
  .png()
  .toBuffer();

await mkdir(path.join(ROOT, "print"), { recursive: true });
await sharp(png).resize({ width: 874 }).png().toFile(path.join(ROOT, "print/affichette-a5.png"));

const pdf = await PDFDocument.create();
pdf.setTitle("Le Disque Bleu, affichette A5");
const page = pdf.addPage([419.53, 595.28]); // A5 en points
const jpg = await pdf.embedJpg(await sharp(png).jpeg({ quality: 94 }).toBuffer());
page.drawImage(jpg, { x: 0, y: 0, width: 419.53, height: 595.28 });
await writeFile(path.join(ROOT, "print/affichette-a5.pdf"), await pdf.save());
console.log(`affichette A5 écrite, QR code → ${site.url}`);
