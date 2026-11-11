// CONTENU.md : tous les textes du site et la carte, en français et en anglais, pour relecture et validation.
//   npm run contenu
// Le fichier est régénéré à partir de locales/*.json et de data/*.json : corrigez les textes dans ces fichiers,
// pas dans CONTENU.md.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ROOT } from "./draw.mjs";

const json = async (f) => JSON.parse(await readFile(path.join(ROOT, f), "utf8"));
const [fr, en, carte, site, horaires, pdj, annonces, evenements] = await Promise.all(["locales/fr.json", "locales/en.json", "data/carte.json", "data/site.json", "data/horaires.json", "data/plat-du-jour.json", "data/annonces.json", "data/evenements.json"].map(json));

const out = [];
const h = (n, t) => out.push("", `${"#".repeat(n)} ${t}`, "");
const pair = (label, a, b) => out.push(`- **${label}**`, `  - FR : ${a}`, `  - EN : ${b}`);
const TODO = "**À REMPLIR**";

out.push("# Le Disque Bleu : contenu du site", "", "Tous les textes et la carte, pour validation. Ce qui est marqué « À REMPLIR » manque encore : voir INFOS-A-DEMANDER.md.", "", `Relevé le ${carte.checked} à partir de son Instagram (@ledisquebleu_, 48 publications et stories à la une) et de sa fiche Google.`);

h(2, "Titre du hero : trois options");
out.push("1. **La brasserie de la place** (retenue : c'est ce que disent ses clients, et c'est là qu'elle se trouve)", "2. Du café du matin au cocktail du soir", "3. Fait maison, servi avec le sourire (utilisée comme titre de la carte)");

h(2, "Référencement");
pair("Titre de l'accueil", fr.meta.title, en.meta.title);
pair("Description", fr.meta.description, en.meta.description);
for (const id of Object.keys(fr.pages)) pair(`Page « ${fr.pages[id].title} »`, `${fr.pages[id].metaTitle} — ${fr.pages[id].metaDescription}`, `${en.pages[id].metaTitle} — ${en.pages[id].metaDescription}`);

h(2, "Hero");
for (const k of ["eyebrow", "title", "sub", "ctaReserve", "ctaMenu"]) pair(k, fr.hero[k], en.hero[k]);
out.push("", `Note Google affichée : ${site.rating.value}/5, ${site.rating.count} avis (relevée le ${site.rating.checked}).`);

h(2, "Bandeau du haut");
pair("Message par défaut", annonces.default.fr, annonces.default.en);
for (const a of annonces.items) pair(`Du ${a.from} au ${a.to}`, a.fr, a.en);
out.push("", "Quand le plat du jour est renseigné dans `data/plat-du-jour.json`, le bandeau l'affiche à la place.");

h(2, "Tuiles et services");
for (const k of Object.keys(fr.tiles.items)) pair("Tuile", fr.tiles.items[k], en.tiles.items[k]);
fr.services.items.forEach((s, i) => pair("Service", `${s.title} — ${s.text}`, `${en.services.items[i].title} — ${en.services.items[i].text}`));

h(2, "Plat du jour");
for (const k of ["eyebrow", "title", "text", "monday", "cta", "call"]) pair(k, fr.pdj[k], en.pdj[k]);
pair("Sans plat renseigné", pdj.fallback.fr, pdj.fallback.en);
out.push("", `Plat du jour de chaque jour et son prix : ${TODO} dans \`data/plat-du-jour.json\`.`);

h(2, "La carte");
pair("Titre", fr.carte.title, en.carte.title);
pair("Introduction", fr.carte.intro, en.carte.intro);
out.push("", `Aucun prix n'est connu : ${TODO} dans \`data/carte.json\` (champ \`price\`). Tant qu'il est vide, le site n'affiche pas de prix et indique « ${fr.carte.priceNote} »`);
for (const c of carte.categories) {
  h(3, `${fr.carte.tabs[c.id]} / ${en.carte.tabs[c.id]}`);
  out.push(`_${fr.carte.notes[c.id]}_`, "", "| Plat | Description | Dish | Description | Prix | À emporter |", "|---|---|---|---|---|---|");
  for (const id of c.items) {
    const it = carte.items[id];
    const tags = it.tags.map((t) => fr.carte.tags[t]).join(", ");
    out.push(`| ${fr.products[id].name}${tags ? ` _(${tags})_` : ""} | ${fr.products[id].desc} | ${en.products[id].name} | ${en.products[id].desc} | ${it.price === null ? "À REMPLIR" : `${it.price} €`} | ${it.orderable ? "oui" : "non"} |`);
  }
}

h(2, "Les trois blocs");
for (const k of Object.keys(fr.blocks)) pair(fr.blocks[k].title, `${fr.blocks[k].text} [${fr.blocks[k].cta}]`, `${en.blocks[k].title} — ${en.blocks[k].text} [${en.blocks[k].cta}]`);

h(2, "Soirées et privatisation");
pair("Titre", fr.events.title, en.events.title);
pair("Introduction", fr.events.intro, en.events.intro);
for (const k of Object.keys(fr.events.kinds)) pair(fr.events.kinds[k].title, fr.events.kinds[k].text, `${en.events.kinds[k].title} — ${en.events.kinds[k].text}`);
pair(fr.events.privat.title, fr.events.privat.text, `${en.events.privat.title} — ${en.events.privat.text}`);
out.push("", `Prochaines dates : ${TODO} dans \`data/evenements.json\` (aucune date inventée ; le site affiche « ${fr.events.soon} »).`, "", "Soirées passées relevées sur Instagram (pour mémoire, non affichées) :", ...evenements.past.map((p) => `- ${p}`));

h(2, "La maison");
pair("Titre", fr.team.title, en.team.title);
fr.team.text.forEach((p, i) => pair(`Paragraphe ${i + 1}`, p, en.team.text[i]));
out.push("", `Prénom du patron, de l'équipe et histoire du nom : ${TODO}.`);

h(2, "Avis");
pair("Texte", fr.reviews.text, en.reviews.text);
out.push("", `Vrais avis clients : ${TODO} dans \`data/avis.json\`, avec son accord. Aucun avis n'est inventé.`);

h(2, "Infos pratiques");
out.push(`- Adresse : ${site.address.street}, ${site.address.postalCode} ${site.address.city}`, `- Téléphone : ${site.phone}`, `- Instagram : ${site.instagram}`, `- E-mail : ${site.email || TODO}`, "- Horaires :");
fr.infos.days.forEach((d, i) => out.push(`  - ${d} : ${(horaires.week[String(i + 1)] ?? []).map(([a, b]) => `${a} – ${b}`).join(", ") || "fermé"}`));
out.push(`  - Été : jusqu'à 22 h du lundi au samedi (dates de début et de fin : ${TODO} dans \`data/horaires.json\` → summer)`);
pair("Accès", fr.infos.accessText, en.infos.accessText);

h(2, "FAQ");
fr.faq.items.forEach((f, i) => pair(f.q, f.a, `${en.faq.items[i].q} — ${en.faq.items[i].a}`));

h(2, "Pages « Restaurant à Montmorency » et « Bar et terrasse à Montmorency »");
for (const id of ["restaurant", "bar"]) {
  h(3, fr.pages[id].h1);
  pair("Introduction", fr.pages[id].intro, en.pages[id].intro);
  fr.pages[id].sections.forEach((s, i) => pair(s.h, s.p.join(" "), `${en.pages[id].sections[i].h} — ${en.pages[id].sections[i].p.join(" ")}`));
}

h(2, "Formulaires");
pair("Réservation, message de fin", fr.resa.done, en.resa.done);
pair("Commande, message de fin", fr.order.done, en.order.done);
pair("Privatisation, message de fin", fr.privat.done, en.privat.done);
pair("Tant que l'e-mail n'est pas branché", fr.resa.doneNoMail, en.resa.doneNoMail);

await writeFile(path.join(ROOT, "CONTENU.md"), out.join("\n") + "\n");
console.log(`CONTENU.md écrit (${out.length} lignes)`);
