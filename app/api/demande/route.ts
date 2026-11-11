import { Resend } from "resend";
import { orderText, parseOrder, parsePrivat, parseResa, privatText, resaText } from "@/lib/requests";
import { fill, getDict, isLocale, type Locale } from "@/lib/i18n";

// Réservation de table (kind: "resa"), commande à emporter (kind: "order") et privatisation (kind: "privat"),
// envoyées par e-mail (Resend) :
//  1. notification au restaurant (en français, avec la langue du client) ;
//  2. confirmation au client, dans sa langue, s'il a donné son e-mail.
// Variables Vercel : RESEND_API_KEY, NOTIFY_EMAIL (adresse du restaurant), RESEND_FROM (domaine vérifié dans Resend,
// ex. « Le Disque Bleu <reservation@mondomaine.fr> » ; sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte).
// Sans ces variables, la route répond { notified: false } et le site invite le client à appeler pour confirmer.

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function html(title: string, text: string) {
  const body = escapeHtml(text)
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 18px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="background:#F6F0E4;padding:32px 16px"><div style="max-width:560px;margin:0 auto;background:#ffffff;border-top:4px solid #1C3D6E;padding:32px 28px;font-family:Helvetica,Arial,sans-serif;color:#1E1B18;font-size:15px;line-height:1.65">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#A63A2B">Le Disque Bleu · Montmorency</p>
<h1 style="margin:0 0 24px;font-family:Georgia,serif;font-weight:normal;font-size:26px;color:#1C3D6E">${escapeHtml(title)}</h1>${body}</div></div>`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  // Champ piège : rempli seulement par les robots
  if (typeof body.website === "string" && body.website) return Response.json({ ok: true, notified: true, confirmed: false });
  const lang: Locale = typeof body.lang === "string" && isLocale(body.lang) ? body.lang : "fr";
  const fr = getDict("fr");
  const d = getDict(lang);

  let notify: { subject: string; title: string; text: string; replyTo: string };
  let confirm: { to: string; subject: string; text: string } | null;
  const mk = (name: string, email: string, m: { confirmSubject: string; confirmIntro: string; confirmOutro: string }, text: string) =>
    email ? { to: email, subject: m.confirmSubject, text: `${fill(m.confirmIntro, { name })}\n\n${text}\n\n${m.confirmOutro}` } : null;

  if (body.kind === "resa") {
    const r = parseResa(body.data);
    if (!r) return Response.json({ ok: false }, { status: 400 });
    notify = { subject: `${fr.resa.mail.subject} · ${r.name} · ${r.day} ${r.time} · ${r.guests} pers.`, title: fr.resa.mail.title, text: resaText(r, "fr", fr), replyTo: r.email };
    confirm = mk(r.name, r.email, d.resa.mail, resaText(r, lang, d, false));
  } else if (body.kind === "order") {
    const q = parseOrder(body.data);
    if (!q) return Response.json({ ok: false }, { status: 400 });
    notify = { subject: `${fr.order.mail.subject} · ${q.name} · ${q.day} ${q.time}`, title: fr.order.mail.title, text: orderText(q, "fr", fr), replyTo: q.email };
    confirm = mk(q.name, q.email, d.order.mail, orderText(q, lang, d, false));
  } else if (body.kind === "privat") {
    const p = parsePrivat(body.data);
    if (!p) return Response.json({ ok: false }, { status: 400 });
    notify = { subject: `${fr.privat.mail.subject} · ${p.name} · ${p.day} · ${p.guests} pers.`, title: fr.privat.mail.title, text: privatText(p, "fr", fr), replyTo: p.email };
    confirm = mk(p.name, p.email, d.privat.mail, privatText(p, lang, d, false));
  } else return Response.json({ ok: false }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return Response.json({ ok: true, notified: false, confirmed: false });

  const resend = new Resend(key);
  const from = process.env.RESEND_FROM ?? "Le Disque Bleu <onboarding@resend.dev>";
  const text = lang === "fr" ? notify.text : `${notify.text}\n\n${fr.resa.mail.lang} : ${lang.toUpperCase()}`;

  let notified = false;
  let confirmed = false;
  try {
    const r = await resend.emails.send({ from, to, replyTo: notify.replyTo || undefined, subject: notify.subject, html: html(notify.title, text), text });
    notified = !r.error;
  } catch {}

  if (confirm && notified) {
    try {
      const r = await resend.emails.send({ from, to: confirm.to, replyTo: to, subject: confirm.subject, html: html(confirm.subject, confirm.text), text: confirm.text });
      confirmed = !r.error;
    } catch {}
  }
  return Response.json({ ok: true, notified, confirmed });
}
